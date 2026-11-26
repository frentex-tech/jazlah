import type { ORDER_TYPES } from '@modules/orders';

/** A kind of order a cart line is (`ORDER_TYPES` without `mixed`, which is several of them). */
export type SchedulingOrderType = Exclude<
  (typeof ORDER_TYPES)[number],
  'mixed'
>;
