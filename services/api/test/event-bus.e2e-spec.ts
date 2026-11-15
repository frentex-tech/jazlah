import { randomUUID } from 'node:crypto';
import { INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { loadEnv } from '@config/load-env';
import { PrismaService } from '@infra/database/prisma.service';
import { buildJobId } from '@infra/queue/build-job-id';
import { QUEUE_KEY_PREFIX } from '@infra/queue/queue.constants';
import { AppModule } from '../src/app.module';
import { EventProbePublisherModule } from './support/events/event-probe-publisher.module';
import { EventProbePublisherService } from './support/events/event-probe-publisher.service';
import { EVENT_PROBE_QUEUE } from './support/events/event-probe-queue.constants';
import { EventProbeSubscriberModule } from './support/events/event-probe-subscriber.module';
import { EventTrace } from './support/events/event-trace';
import { EventTraceModule } from './support/events/event-trace.module';
import { ProbeCompletedEvent } from './support/events/probe-completed.event';
import { ProbeFaultedEvent } from './support/events/probe-faulted.event';
import { ProbeFollowUpProcessor } from './support/events/probe-follow-up.processor';
import { ProbeHappenedEvent } from './support/events/probe-happened.event';
import { waitForWorkerEvent } from './support/wait-for-worker-event';

/**
 * The event bus, end to end: a publisher in one test module, subscribers in another,
 * the real database and Redis. Every test writes its steps to one EventTrace, and the
 * order is printed (`delivery order`) so the run shows it.
 */
describe('Event bus (e2e)', () => {
  let app: INestApplication;
  let publisher: EventProbePublisherService;
  let trace: EventTrace;
  let prisma: PrismaService;
  const auditIds: string[] = [];
  const inspector = new Queue(EVENT_PROBE_QUEUE, {
    connection: { url: loadEnv().REDIS_URL },
    prefix: QUEUE_KEY_PREFIX,
  });

  beforeAll(async () => {
    await inspector.obliterate({ force: true });
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        EventTraceModule,
        EventProbePublisherModule,
        EventProbeSubscriberModule,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    publisher = app.get(EventProbePublisherService);
    trace = app.get(EventTrace);
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await prisma.auditLog.deleteMany({ where: { id: { in: auditIds } } });
    auditIds.splice(0);
  });

  afterAll(async () => {
    await app.close();
    await inspector.obliterate({ force: true });
    await inspector.close();
  });

  /** The trace entries about one probe, without its id, as the delivery order. */
  function orderOf(probeId: string): string[] {
    const order = trace.entries
      .filter((entry) => entry.includes(probeId))
      .map((entry) => entry.replace(`:${probeId}`, ''));
    process.stdout.write(
      `delivery order [${expect.getState().currentTestName}]:\n  ${order.join(' -> ')}\n`,
    );
    return order;
  }

  function newProbeId(): string {
    const id = randomUUID();
    auditIds.push(id);
    return id;
  }

  it('delivers an event published outside a transaction to a subscriber in another module', async () => {
    const probeId = newProbeId();
    publisher.publishNow(
      ProbeHappenedEvent,
      new ProbeHappenedEvent(probeId),
      probeId,
    );
    await trace.waitFor(`delivered:${probeId}`);

    expect(orderOf(probeId)).toEqual([
      'published',
      'delivery-started',
      'delivered:row-absent',
    ]);
  });

  it('delivers an event published in a transaction only after the commit', async () => {
    const probeId = newProbeId();
    await publisher.publishInTransaction(probeId, 'commit');
    await trace.waitFor(`delivered:${probeId}`);

    // Published first, then the transaction kept running for two event-loop turns and a
    // query without the subscriber running; it ran after the commit and saw the row.
    expect(orderOf(probeId)).toEqual([
      'published',
      'transaction-work-done',
      'committed',
      'delivery-started',
      'delivered:row-visible',
    ]);
  });

  it('never delivers an event published in a transaction that rolls back', async () => {
    const probeId = newProbeId();
    await expect(
      publisher.publishInTransaction(probeId, 'rollback'),
    ).rejects.toThrow('roll back on purpose');

    // Dispatch is first in, first out: once a later event is delivered, an earlier one
    // that was going to be delivered would have been.
    const sentinel = newProbeId();
    publisher.publishNow(
      ProbeHappenedEvent,
      new ProbeHappenedEvent(sentinel),
      sentinel,
    );
    await trace.waitFor(`delivered:${sentinel}`);

    expect(orderOf(probeId)).toEqual(['published', 'transaction-work-done']);
    expect(
      await prisma.auditLog.findUnique({ where: { id: probeId } }),
    ).toBeNull();
  });

  it("holds a nested transaction's event until the outer transaction commits", async () => {
    const probeId = newProbeId();
    await publisher.publishInNestedTransaction(probeId);
    await trace.waitFor(`delivered:${probeId}`);

    expect(orderOf(probeId)).toEqual([
      'published',
      'inner-transaction-returned',
      'outer-work-done',
      'committed',
      'delivery-started',
      'delivered:row-visible',
    ]);
  });

  it('logs a throwing subscriber, still runs the other subscriber, and the publisher succeeds', async () => {
    let logged!: (fields: unknown) => void;
    const errorLogged = new Promise<unknown>((resolve) => {
      logged = resolve;
    });
    jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation((fields: unknown) => {
        logged(fields);
      });
    const probeId = newProbeId();

    expect(() =>
      publisher.publishNow(
        ProbeFaultedEvent,
        new ProbeFaultedEvent(probeId),
        probeId,
      ),
    ).not.toThrow();
    await trace.waitFor(`healthy-ran:${probeId}`);
    const fields = await errorLogged;

    expect(orderOf(probeId).sort()).toEqual(
      ['faulty-ran', 'healthy-ran', 'published'].sort(),
    );
    expect(fields).toMatchObject({
      event: 'probes.probe.faulted',
      subscriber: 'FaultyProbeSubscriber.onProbeFaulted',
      err: { message: 'subscriber failure' },
    });
  });

  it('runs one job when a subscriber enqueues with a deterministic id for the same event twice', async () => {
    const probeId = newProbeId();
    const completed = waitForWorkerEvent(
      app.get(ProbeFollowUpProcessor).worker,
      'completed',
      (job) => job.id === buildJobId('probe-follow-up', probeId),
    );
    publisher.publishNow(
      ProbeCompletedEvent,
      new ProbeCompletedEvent(probeId),
      probeId,
    );
    publisher.publishNow(
      ProbeCompletedEvent,
      new ProbeCompletedEvent(probeId),
      probeId,
    );
    await trace.waitFor(`enqueued:${probeId}`, 2);
    await completed;

    const order = orderOf(probeId);
    expect(order.filter((entry) => entry === 'enqueued')).toHaveLength(2);
    expect(order.filter((entry) => entry === 'job-ran')).toHaveLength(1);
    const counts = await inspector.getJobCounts();
    expect(counts).toMatchObject({
      completed: 1,
      waiting: 0,
      active: 0,
      delayed: 0,
      failed: 0,
    });
  });
});
