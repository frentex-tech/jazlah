import type { DomainEvent } from './domain-event';

/** The name an event type declares: `EventNameOf<OrderPlacedEvent>` is `'orders.order.placed'`. */
export type EventNameOf<E extends DomainEvent> =
  E extends DomainEvent<infer Name> ? Name : never;
