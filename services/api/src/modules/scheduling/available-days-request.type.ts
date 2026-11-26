import type { FULFILMENT_METHODS } from '@modules/orders';
import type { SchedulingOrderType } from './scheduling-order-type.type';

/** Which days a vendor's cart can be fulfilled on: by which method, for which kinds of order. */
export type AvailableDaysRequest = Readonly<{
  vendorId: string;
  method: (typeof FULFILMENT_METHODS)[number];
  /** The cart's kinds of order; the strictest cut-off applies. */
  orderTypes: readonly SchedulingOrderType[];
}>;
