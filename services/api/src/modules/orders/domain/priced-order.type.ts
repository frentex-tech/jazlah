import type { Money } from '@common/money/money';

/** The money of an order: all in halalas, VAT included. */
export type PricedOrder = Readonly<{
  subtotal: Money;
  discount: Money;
  deliveryFee: Money;
  /** subtotal - discount + delivery fee. */
  total: Money;
  /** The VAT inside the total. */
  vat: Money;
}>;
