import type { Money } from '@common/money/money';
import type { OrderItemNames } from './order-item-names.type';

/** A saved line of an order. */
export type OrderItem = Readonly<{
  id: string;
  productId: string;
  sizeId: string;
  quantity: number;
  unitPrice: Money;
  total: Money;
  packaging: string | null;
  notes: string | null;
  imageUrl: string | null;
  names: OrderItemNames;
}>;
