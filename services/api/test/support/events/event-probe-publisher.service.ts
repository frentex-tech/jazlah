import { Injectable } from '@nestjs/common';
import { DbContext } from '@infra/database/db-context';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { EventPublisher } from '@infra/event-bus/event-publisher';
import type { DomainEvent } from '@common/events/domain-event';
import type { DomainEventClass } from '@common/events/domain-event-class.type';
import { EventTrace } from './event-trace';
import { ProbeHappenedEvent } from './probe-happened.event';
import { yieldToEventLoop } from './yield-to-event-loop';

/**
 * The publishing side of the event tests, in its own module, written the way a use
 * case publishes. Each step is written to the trace.
 */
@Injectable()
export class EventProbePublisherService {
  constructor(
    private readonly db: DbContext,
    private readonly transactions: TransactionRunner,
    private readonly events: EventPublisher,
    private readonly trace: EventTrace,
  ) {}

  /** Publishes outside any transaction. */
  publishNow<E extends DomainEvent>(
    eventClass: DomainEventClass<E>,
    event: E,
    label: string,
  ): void {
    this.events.publish(eventClass, event);
    this.trace.add(`published:${label}`);
  }

  /**
   * Writes an audit row and publishes inside one transaction, then gives the event
   * loop two turns and a query, so an event delivered too early would show up before
   * `transaction-work-done`. Rolls back when asked to.
   */
  async publishInTransaction(
    probeId: string,
    outcome: 'commit' | 'rollback',
  ): Promise<void> {
    await this.transactions.run(async () => {
      await this.db.client.auditLog.create({ data: this.auditRow(probeId) });
      this.events.publish(ProbeHappenedEvent, new ProbeHappenedEvent(probeId));
      this.trace.add(`published:${probeId}`);
      await yieldToEventLoop();
      await this.db.client.$queryRaw`SELECT 1`;
      await yieldToEventLoop();
      this.trace.add(`transaction-work-done:${probeId}`);
      if (outcome === 'rollback') {
        throw new Error('roll back on purpose');
      }
    });
    this.trace.add(`committed:${probeId}`);
  }

  /** Publishes in a nested transaction, which joins the outer one. */
  async publishInNestedTransaction(probeId: string): Promise<void> {
    await this.transactions.run(async () => {
      await this.transactions.run(async () => {
        await this.db.client.auditLog.create({ data: this.auditRow(probeId) });
        this.events.publish(
          ProbeHappenedEvent,
          new ProbeHappenedEvent(probeId),
        );
        this.trace.add(`published:${probeId}`);
      });
      this.trace.add(`inner-transaction-returned:${probeId}`);
      await yieldToEventLoop();
      await this.db.client.$queryRaw`SELECT 1`;
      await yieldToEventLoop();
      this.trace.add(`outer-work-done:${probeId}`);
    });
    this.trace.add(`committed:${probeId}`);
  }

  private auditRow(probeId: string) {
    return {
      id: probeId,
      action: 'probe.published',
      entity: 'probe',
      entityId: probeId,
    };
  }
}
