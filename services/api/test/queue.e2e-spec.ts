import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication, Logger } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { loadEnv } from '@config/load-env';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildJobId } from '@infra/queue/build-job-id';
import { DEFAULT_JOB_OPTIONS } from '@infra/queue/default-job-options.constants';
import { QUEUE_KEY_PREFIX } from '@infra/queue/queue.constants';
import { createQueueProbeApp } from './support/create-queue-probe-app';
import { PROBE_QUEUES } from './support/queue-probe.constants';
import { QueueProbeProcessor } from './support/queue-probe.processor';
import { StalledProbeProcessor } from './support/stalled-probe.processor';
import { StuckProbeProcessor } from './support/stuck-probe.processor';
import { startTcpProxy } from './support/tcp-proxy';
import { waitForWorkerEvent } from './support/wait-for-worker-event';

jest.setTimeout(20_000);

/**
 * The queue foundation, against the test Redis database (REDIS_URL logical database
 * + 1, set by scripts/e2e.mjs). Every probe queue is emptied before and after the run.
 */
describe('Queue (e2e)', () => {
  /** Queues outside any app, to inspect jobs after an app has shut down and to clean up. */
  const inspectors = Object.values(PROBE_QUEUES).map(
    (name) =>
      new Queue(name, {
        connection: { url: loadEnv().REDIS_URL },
        prefix: QUEUE_KEY_PREFIX,
      }),
  );
  const inspector = (name: string): Queue => {
    const queue = inspectors.find((candidate) => candidate.name === name);
    if (queue === undefined) {
      throw new Error(`no inspector for ${name}`);
    }
    return queue;
  };

  let app: INestApplication | undefined;

  async function obliterateAll(): Promise<void> {
    await Promise.all(
      inspectors.map((queue) => queue.obliterate({ force: true })),
    );
  }

  beforeAll(obliterateAll);

  afterEach(async () => {
    jest.restoreAllMocks();
    await app?.close();
    app = undefined;
    await obliterateAll();
  });

  afterAll(async () => {
    await obliterateAll();
    await Promise.all(inspectors.map((queue) => queue.close()));
  });

  async function start(): Promise<{
    app: INestApplication;
    probe: Queue;
    processor: QueueProbeProcessor;
  }> {
    app = await createQueueProbeApp({
      workers: [
        QueueProbeProcessor,
        StuckProbeProcessor,
        StalledProbeProcessor,
      ],
    });
    return {
      app,
      probe: app.get<Queue>(getQueueToken(PROBE_QUEUES.probe)),
      processor: app.get(QueueProbeProcessor),
    };
  }

  it('runs no worker unless one is turned on, and producers still add jobs', async () => {
    app = await createQueueProbeApp();
    const probe = app.get<Queue>(getQueueToken(PROBE_QUEUES.probe));
    // Connected first: under a full parallel e2e run the first connection can take
    // longer than the bounded add waits, which is not what this test is about.
    await probe.waitUntilReady();

    const job = await probe.add('succeed', { key: 'no-worker' });

    expect(app.get(QueueProbeProcessor)).not.toBeInstanceOf(
      QueueProbeProcessor,
    );
    expect(await probe.getWorkersCount()).toBe(0);
    expect(await job.getState()).toBe('waiting');
  });

  it('starts only the worker a test turns on', async () => {
    app = await createQueueProbeApp({ workers: [QueueProbeProcessor] });

    expect(app.get(QueueProbeProcessor)).toBeInstanceOf(QueueProbeProcessor);
    expect(app.get(StuckProbeProcessor)).not.toBeInstanceOf(
      StuckProbeProcessor,
    );
    const probe = app.get<Queue>(getQueueToken(PROBE_QUEUES.probe));
    const stuck = app.get<Queue>(getQueueToken(PROBE_QUEUES.stuck));
    await app.get(QueueProbeProcessor).worker.waitUntilReady();
    expect(await probe.getWorkersCount()).toBe(1);
    expect(await stuck.getWorkersCount()).toBe(0);
  });

  it('applies the default job options to a queue that does not override them', async () => {
    const started = await start();
    const defaults = started.app.get<Queue>(
      getQueueToken(PROBE_QUEUES.defaults),
    );
    const job = await defaults.add('anything', { key: 'k' });
    expect(job.opts).toMatchObject(DEFAULT_JOB_OPTIONS);
  });

  it('fails fast with SERVICE_UNAVAILABLE when adding a job after Redis stops', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const redisUrl = new URL(loadEnv().REDIS_URL);
    const proxy = await startTcpProxy(redisUrl.hostname, Number(redisUrl.port));
    const proxied = new URL(redisUrl);
    proxied.hostname = '127.0.0.1';
    proxied.port = String(proxy.port);
    // A producer only (no workers turned on): no worker shares the stopped connection.
    // (BullMQ 6.7.6 workers whose connection dropped and came back were seen never to
    // finish close(), which is not what this test is about.)
    app = await createQueueProbeApp({ redisUrl: proxied.toString() });
    const probe = app.get<Queue>(getQueueToken(PROBE_QUEUES.probe));
    await probe.add('succeed', { key: 'before-outage' });

    await proxy.stop();
    const outcomes: { ms: number; error: unknown }[] = [];
    for (let i = 0; i < 5; i += 1) {
      const startedAt = performance.now();
      const error: unknown = await probe
        .add('succeed', { key: `during-outage-${i}` })
        .then(
          () => undefined,
          (rejected: unknown) => rejected,
        );
      outcomes.push({ ms: performance.now() - startedAt, error });
    }
    process.stdout.write(
      `adding a job with Redis stopped: ${outcomes
        .map(({ ms, error }) =>
          error instanceof AppError
            ? `${error.status} ${error.code} in ${ms.toFixed(1)} ms`
            : `no error in ${ms.toFixed(1)} ms`,
        )
        .join(', ')}
`,
    );
    for (const { ms, error } of outcomes) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        code: ErrorCode.SERVICE_UNAVAILABLE,
        status: 503,
      });
      expect(ms).toBeLessThan(1_000);
    }

    // Redis back, so the app closes as usual (BullMQ waits for its connections).
    await proxy.resume();
    await app.close();
    app = undefined;
    await proxy.stop();
  });

  it('processes a job', async () => {
    const { probe, processor } = await start();
    const completed = waitForWorkerEvent(
      processor.worker,
      'completed',
      (job) => job.name === 'succeed',
    );
    const job = await probe.add('succeed', { key: 'processed-1' });

    const done = await completed;
    expect(done.id).toBe(job.id);
    expect(done.returnvalue).toBe('done:processed-1');
    expect(processor.completedKeys).toEqual(['processed-1']);
    expect(await probe.getJobState(job.id ?? '')).toBe('completed');
  });

  it('retries a failing job, then keeps it as failed and logs it at error', async () => {
    const errors = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const warnings = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const { probe, processor } = await start();
    const finalFailure = waitForWorkerEvent(
      processor.worker,
      'failed',
      (job) => job.attemptsMade >= 3,
    );
    const job = await probe.add('fail', { key: 'failing-1' });
    await finalFailure;

    const stored = await probe.getJob(job.id ?? '');
    expect(await probe.getJobState(job.id ?? '')).toBe('failed');
    expect(stored?.attemptsMade).toBe(3);
    expect(stored?.failedReason).toBe('probe failure');

    const retryLines = warnings.mock.calls.filter(
      ([, message]) => message === 'Job failed; it will be retried',
    );
    const retryFields: unknown[] = retryLines.map(
      ([fields]: unknown[]) => fields,
    );
    expect(retryFields).toMatchObject([
      { jobId: job.id, attempt: 1, maxAttempts: 3 },
      { jobId: job.id, attempt: 2, maxAttempts: 3 },
    ]);
    const finalLines = errors.mock.calls.filter(
      ([, message]) =>
        message === 'Job failed on its last attempt; it is kept as failed',
    );
    expect(finalLines).toHaveLength(1);
    const finalFields: unknown = finalLines[0]?.[0];
    expect(finalFields).toMatchObject({
      queue: PROBE_QUEUES.probe,
      jobName: 'fail',
      jobId: job.id,
      attempt: 3,
      maxAttempts: 3,
      err: { message: 'probe failure' },
    });
  });

  it('logs "completed" only after BullMQ has recorded the completion', async () => {
    const queue = inspector(PROBE_QUEUES.probe);
    /** The job's state read the moment the line was written. */
    const statesAtLog: Promise<string>[] = [];
    jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation((fields: unknown, message?: unknown) => {
        if (message === 'Job completed') {
          const { jobId } = fields as { jobId: string };
          statesAtLog.push(queue.getJobState(jobId));
        }
      });
    const { probe, processor } = await start();
    const completed = waitForWorkerEvent(
      processor.worker,
      'completed',
      (job) => job.name === 'succeed',
    );
    await probe.add('succeed', { key: 'recorded-1' });
    await completed;

    expect(statesAtLog).toHaveLength(1);
    expect(await statesAtLog[0]).toBe('completed');
  });

  it('does not log a job postponed with DelayedError as failed, and runs it again', async () => {
    const warnings = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const errors = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { probe, processor } = await start();
    const completed = waitForWorkerEvent(
      processor.worker,
      'completed',
      (job) => job.name === 'delay',
    );
    const job = await probe.add('delay', { key: 'delayed-1' });
    await completed;

    expect(processor.completedKeys).toEqual(['delayed-1']);
    const failureLines = [...warnings.mock.calls, ...errors.mock.calls].filter(
      ([fields]) => (fields as { jobId?: unknown }).jobId === job.id,
    );
    expect(failureLines).toEqual([]);
  });

  it('logs the final failure of a job that stalled', async () => {
    const errors = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    // Another worker takes the job and never renews its lock, as a crashed instance would.
    const crashed = new Worker(PROBE_QUEUES.stalled, null, {
      connection: { url: loadEnv().REDIS_URL },
      prefix: QUEUE_KEY_PREFIX,
      lockDuration: 300,
      autorun: false,
    });
    const job = await inspector(PROBE_QUEUES.stalled).add('stall', {});
    const taken = await crashed.getNextJob('crashed-worker-token');
    expect(taken?.id).toBe(job.id);

    const started = await start();
    const stalledProcessor = started.app.get(StalledProbeProcessor);
    const failed = waitForWorkerEvent(
      stalledProcessor.worker,
      'failed',
      (failedJob) => failedJob.id === job.id,
    );
    await failed;
    await crashed.close();

    const finalLines = errors.mock.calls.filter(
      ([fields, message]) =>
        message === 'Job failed on its last attempt; it is kept as failed' &&
        (fields as { jobId?: unknown }).jobId === job.id,
    );
    process.stdout.write(
      `stalled job's final failure log line: ${JSON.stringify(finalLines[0]?.[0], (key, value: unknown) => (key === 'err' && value instanceof Error ? { name: value.name, message: value.message } : value))} ${String(finalLines[0]?.[1])}
`,
    );
    expect(finalLines).toHaveLength(1);
    expect(finalLines[0]?.[0]).toMatchObject({
      queue: PROBE_QUEUES.stalled,
      jobName: 'stall',
      jobId: job.id,
      err: { message: 'job stalled more than allowable limit' },
    });
    expect(stalledProcessor.handled).toBe(0);
    expect(
      await inspector(PROBE_QUEUES.stalled).getJobState(job.id ?? ''),
    ).toBe('failed');
  });

  it('processes a job enqueued twice with the same deterministic id once', async () => {
    const { probe, processor } = await start();
    const jobId = buildJobId('probe-webhook', 'example-provider', 'evt-1');
    const completed = waitForWorkerEvent(
      processor.worker,
      'completed',
      (job) => job.id === jobId,
    );
    const first = await probe.add('succeed', { key: 'dedup-1' }, { jobId });
    const second = await probe.add('succeed', { key: 'dedup-1' }, { jobId });
    await completed;
    // Also after the first run has completed: the kept job still blocks the id.
    const third = await probe.add('succeed', { key: 'dedup-1' }, { jobId });

    expect([first.id, second.id, third.id]).toEqual([jobId, jobId, jobId]);
    expect(processor.completedKeys).toEqual(['dedup-1']);
    expect(await probe.getJobCounts()).toMatchObject({
      completed: 1,
      waiting: 0,
      active: 0,
      delayed: 0,
      failed: 0,
    });
  });

  it('ignores an add with the id of a job kept as failed: the id stays blocked', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { probe, processor } = await start();
    const jobId = buildJobId('probe-webhook', 'example-provider', 'evt-failed');
    const finalFailure = waitForWorkerEvent(
      processor.worker,
      'failed',
      (job) => job.id === jobId && job.attemptsMade >= 3,
    );
    await probe.add('fail', { key: 'failed-1' }, { jobId });
    await finalFailure;

    const again = await probe.add('succeed', { key: 'failed-1' }, { jobId });

    expect(again.id).toBe(jobId);
    expect(await probe.getJobState(jobId)).toBe('failed');
    expect(processor.completedKeys).toEqual([]);
  });

  it('on SIGTERM, lets the running job finish and picks up no new job', async () => {
    const { app: running, probe, processor } = await start();
    running.enableShutdownHooks();
    // Nest re-sends the signal to the process after shutting down; keep Jest alive.
    let shutDown!: () => void;
    const shutdownDone = new Promise<void>((resolve) => {
      shutDown = resolve;
    });
    jest.spyOn(process, 'kill').mockImplementation(() => {
      shutDown();
      return true;
    });

    const active = waitForWorkerEvent(
      processor.worker,
      'active',
      (job) => job.name === 'slow',
    );
    const slow = await probe.add('slow', { key: 'slow-1', durationMs: 1_000 });
    await active;
    const next = await probe.add('succeed', { key: 'after-shutdown' });

    process.emit('SIGTERM', 'SIGTERM');
    await shutdownDone;
    app = undefined; // already closed by the shutdown hooks

    expect(processor.completedKeys).toEqual(['slow-1']);
    const queue = inspector(PROBE_QUEUES.probe);
    expect(await queue.getJobState(slow.id ?? '')).toBe('completed');
    expect(await queue.getJobState(next.id ?? '')).toBe('waiting');
  });

  it('cancels a job that is still running when the shutdown timeout ends', async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const started = await start();
    const stuckQueue = started.app.get<Queue>(
      getQueueToken(PROBE_QUEUES.stuck),
    );
    const stuck = started.app.get(StuckProbeProcessor);
    const active = waitForWorkerEvent(stuck.worker, 'active', () => true);
    const job = await stuckQueue.add('stuck', {});
    await active;

    const closing = performance.now();
    await started.app.close();
    app = undefined;
    const closeMs = performance.now() - closing;
    stuck.release();

    // The 300 ms timeout of StuckProbeProcessor, not the job, decided when close returned.
    expect(closeMs).toBeLessThan(3_000);
    const stored = await inspector(PROBE_QUEUES.stuck).getJob(job.id ?? '');
    expect(stored?.failedReason).toBe(
      'Job cancelled: the worker is shutting down',
    );
    expect(stored?.attemptsMade).toBe(1);
    // Attempts are left, so the job waits for its retry instead of being lost.
    expect(
      await inspector(PROBE_QUEUES.stuck).getJobState(job.id ?? ''),
    ).toMatch(/^(delayed|waiting)$/);
  });
});
