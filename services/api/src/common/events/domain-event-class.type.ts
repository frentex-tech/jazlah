import type { DomainEvent } from './domain-event';
import type { EventNameOf } from './event-name-of.type';

/**
 * An event class: constructs `E`, and its static `eventName` is the name `E` declares.
 * What `EventPublisher.publish` and `@OnDomainEvent` take, so a class whose static name
 * differs from its type's, or that has none, does not compile there.
 */
export type DomainEventClass<E extends DomainEvent> = {
  readonly eventName: EventNameOf<E>;
  readonly name: string;
  new (...args: never[]): E;
};
