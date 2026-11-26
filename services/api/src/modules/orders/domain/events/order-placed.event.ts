import { DomainEvent } from '@common/events/domain-event';

/**
 * An order was placed (published inside the transaction that placed it, so delivered
 * after the commit). Ids only: a subscriber reads the order itself.
 */
export class OrderPlacedEvent extends DomainEvent<'orders.order.placed'> {
  static readonly eventName = 'orders.order.placed';

  constructor(
    readonly orderId: string,
    readonly vendorId: string,
  ) {
    super();
  }
}
