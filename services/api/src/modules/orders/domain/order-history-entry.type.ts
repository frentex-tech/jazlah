import type { OrderActorType } from './order-actor-type.type';
import type { OrderStatus } from './order-status.type';

/** One move of an order between statuses; the first has no `from`. */
export type OrderHistoryEntry = Readonly<{
  from: OrderStatus | null;
  to: OrderStatus;
  actorType: OrderActorType;
  actorId: string | null;
  note: string | null;
  at: Date;
}>;
