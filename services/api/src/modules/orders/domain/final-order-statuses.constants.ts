import type { OrderStatus } from './order-status.type';

/** Statuses after which an order no longer holds a saved address or an account open. */
export const FINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  'delivered',
  'collected',
  'cancelled',
  'returned',
];
