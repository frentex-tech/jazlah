import type { Money } from '@common/money/money';
import type { OrderItemNames } from './order-item-names.type';

/** One line of an order to create: what was chosen, how many, and the unit price charged (VAT included). */
export type NewOrderLine = Readonly<{
  productId: string;
  sizeId: string;
  quantity: number;
  /** Today's server price of one, never a client's. */
  unitPrice: Money;
  /** A packaging name of the catalog; null for none. */
  packaging: string | null;
  notes: string | null;
  imageUrl: string | null;
  names: OrderItemNames;
}>;
