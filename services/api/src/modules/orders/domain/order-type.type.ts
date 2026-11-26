import type { ORDER_TYPES } from './order-types.constants';

/** The kind of an order. */
export type OrderType = (typeof ORDER_TYPES)[number];
