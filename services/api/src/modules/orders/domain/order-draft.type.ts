import type { NewOrder } from './new-order.type';
import type { OrderHistoryEntry } from './order-history-entry.type';
import type { OrderStatus } from './order-status.type';
import type { PricedOrder } from './priced-order.type';

/** An order ready to be saved: the request, its number, its money, its first status and its first history row. */
export type OrderDraft = Readonly<{
  number: string;
  request: NewOrder;
  pricing: PricedOrder;
  status: OrderStatus;
  firstEntry: OrderHistoryEntry;
}>;
