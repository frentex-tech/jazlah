import type { OrderActorType } from './order-actor-type.type';
import type { OrderStatus } from './order-status.type';

/** One committed status change and its insert-only history row. */
export type OrderStatusChange = Readonly<{
  orderId: string;
  from: OrderStatus;
  to: OrderStatus;
  actorType: OrderActorType;
  actorId: string | null;
  note: string | null;
  at: Date;
}>;
