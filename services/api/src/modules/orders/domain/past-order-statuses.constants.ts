import type { OrderStatus } from './order-status.type';

/** The statuses of the customer's `past` tab: delivered, collected, cancelled and returned. Every other status is `current`. */
export const PAST_ORDER_STATUSES = [
  'delivered',
  'collected',
  'cancelled',
  'returned',
] as const satisfies readonly OrderStatus[];
