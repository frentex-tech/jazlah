import type { Cutoffs } from '@modules/settings';
import type { SchedulingOrderType } from './scheduling-order-type.type';

/** The cut-off rule of each kind of order in the operations settings. */
export const ORDER_TYPE_CUTOFF_KEYS: Readonly<
  Record<SchedulingOrderType, keyof Cutoffs>
> = {
  ready_meat: 'readyMeat',
  carcass: 'carcass',
  cooked: 'cooked',
  occasion: 'occasion',
  adha: 'adha',
};
