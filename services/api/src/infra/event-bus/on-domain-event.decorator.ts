import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { DomainEvent } from '@common/events/domain-event';
import type { DomainEventClass } from '@common/events/domain-event-class.type';

const logger = new Logger('EventBus');

/**
 * Subscribes a provider method to an event, given the event's class (never a name), so
 * the method's parameter must be that event: `@OnDomainEvent(OrderPlacedEvent)
 * onOrderPlaced(event: OrderPlacedEvent)`. A method that takes another event does not
 * compile.
 *
 * - The subscriber runs later, on its own, never inside the publisher's call
 *   (`async`: scheduled with setImmediate).
 * - An error it throws is logged at error with the event name and the subscriber's
 *   name (`Class.method`), and affects neither the publisher nor the other subscribers.
 * - It must be idempotent: running it twice for the same event has the effect of once.
 * - It lives in the module that reacts, as a method of a provider of that module.
 */
export function OnDomainEvent<E extends DomainEvent>(
  eventClass: DomainEventClass<E>,
) {
  return (
    target: object,
    methodName: string | symbol,
    // Only `value` matters: the decorated method, which must take exactly this event.
    descriptor: { value?: (event: E) => void | Promise<void> },
  ): void => {
    const handler = descriptor.value;
    if (handler === undefined) {
      return;
    }
    const eventName = eventClass.eventName;
    const subscriber = `${target.constructor.name}.${String(methodName)}`;
    descriptor.value = async function (this: unknown, event: E) {
      try {
        await handler.call(this, event);
      } catch (error) {
        logger.error(
          { err: error, event: eventName, subscriber },
          'Event subscriber failed',
        );
      }
    };
    OnEvent(eventName, { async: true, suppressErrors: false })(
      target,
      methodName,
      descriptor,
    );
  };
}
