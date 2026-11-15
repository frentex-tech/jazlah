import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { DomainEvent } from '@common/events/domain-event';
import type { DomainEventClass } from '@common/events/domain-event-class.type';
import { runAfterCommit } from '../database/run-after-commit';
import { InvalidEventError } from './invalid-event.error';

/**
 * Publishes events on the in-process event bus. Inject it in a use case or service:
 *
 *   this.events.publish(OrderPlacedEvent, new OrderPlacedEvent(orderId, vendorId));
 *
 * - **Type-checked.** The class is given with the event, as `@OnDomainEvent` takes it:
 *   the event must be an instance of that class, and the class's static `eventName`
 *   must be the name its type declares (`DomainEventClass`). A plain object, a class
 *   that is not a DomainEvent, a class without a static name and a class whose static
 *   name differs from its type's do not compile (`test/types/event-bus.type-test.ts`).
 * - Inside `runInTransaction` the event is held until the outermost transaction
 *   commits, and dropped if it rolls back. Outside one, it is dispatched now.
 * - It never waits for subscribers: each runs later, on its own (`@OnDomainEvent`),
 *   so a slow or failing subscriber cannot slow down or fail the publisher.
 * - Delivery is in memory: an event is lost if the process stops before it is
 *   dispatched. Use events only for effects whose loss is acceptable
 *   (`.claude/rules/modules.md`, "Events").
 */
@Injectable()
export class EventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  publish<E extends DomainEvent>(
    eventClass: DomainEventClass<E>,
    event: E,
  ): void {
    const name = this.nameOf(eventClass, event);
    runAfterCommit(() => {
      this.emitter.emit(name, event);
    });
  }

  /**
   * The class's static `eventName`, checked again at run time against what a cast could
   * still slip past the types: a missing name, or an event of another class.
   */
  private nameOf<E extends DomainEvent>(
    eventClass: DomainEventClass<E>,
    event: E,
  ): string {
    const name: unknown = eventClass.eventName;
    if (typeof name !== 'string' || !(event instanceof eventClass)) {
      throw new InvalidEventError(eventClass.name, event.constructor.name);
    }
    return name;
  }
}
