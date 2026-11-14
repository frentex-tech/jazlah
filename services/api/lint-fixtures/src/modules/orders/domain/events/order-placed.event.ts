// lint-rule: R8 conforms
import { DomainEvent } from '@common/events/domain-event';

/** A domain event declared under domain/: extending DomainEvent from src/common is allowed. */
export class OrderPlacedEvent extends DomainEvent<'orders.order.placed'> {
  static readonly eventName = 'orders.order.placed';

  constructor(readonly orderId: string) {
    super();
  }
}
