import type { FulfilmentMethod } from './fulfilment-method.type';

/** What the customer chose: delivery to one of their addresses or pickup, and the Riyadh day. */
export type CartFulfilment = Readonly<{
  method: FulfilmentMethod;
  /** Null for pickup. */
  addressId: string | null;
  /** Riyadh calendar `yyyy-MM-dd`. */
  date: string;
}>;
