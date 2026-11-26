import type { ORDER_STATUSES } from './order-statuses.constants';

/** Where an order is. */
export type OrderStatus = (typeof ORDER_STATUSES)[number];
