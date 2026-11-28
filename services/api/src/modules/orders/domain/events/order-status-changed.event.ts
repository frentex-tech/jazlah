import { DomainEvent } from '@common/events/domain-event';
import type { OrderActorType } from '../order-actor-type.type';
import type { OrderStatus } from '../order-status.type';

/** A committed status change; published inside the transaction and delivered after it. */
export class OrderStatusChangedEvent extends DomainEvent<'order.status.changed'> {
  static readonly eventName = 'order.status.changed';

  constructor(
    readonly orderId: string,
    readonly vendorId: string,
    readonly userId: string,
    readonly from: OrderStatus,
    readonly to: OrderStatus,
    readonly actorType: OrderActorType,
    readonly at: Date,
  ) {
    super();
  }
}
