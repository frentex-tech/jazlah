import type { EventName } from './event-name.type';

/**
 * The base class of every event. Plain TypeScript with no import from Nest or any
 * library, so a module's `domain/` may extend it (R8 allows `src/common`). An event is a
 * fact in the past tense, declared as a class in its own file in the publishing module,
 * exported through the module's `index.ts`:
 *
 * ```ts
 * export class OrderPlacedEvent extends DomainEvent<'orders.order.placed'> {
 *   static readonly eventName = 'orders.order.placed';
 *   constructor(readonly orderId: string, readonly vendorId: string) { super(); }
 * }
 * ```
 *
 * The name appears twice, as the type argument and as the static `eventName`. Both
 * places that take an event class check at compile time that the two are the same:
 * `EventPublisher.publish(EventClass, event)` and `@OnDomainEvent(EventClass)`
 * (`DomainEventClass`); a class without a static `eventName` is refused there too.
 * The payload carries ids and the minimum facts needed to route the event, never a
 * full record.
 */
export abstract class DomainEvent<Name extends EventName = EventName> {
  /**
   * Type only, nothing exists at run time. Being private, it makes a plain object
   * that merely looks like an event unacceptable to the event bus; carrying the name,
   * it keeps events with similar payloads apart.
   */
  declare private readonly eventNameBrand: Name;
}
