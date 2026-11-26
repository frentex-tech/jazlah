import type { Money } from '@common/money/money';

/** The customer's cart as checkout reads it. */
export type CheckoutCart = Readonly<{
  /** Null for an empty cart. */
  vendorId: string | null;
  /** How each line's product may be fulfilled; null for one the public cannot see. */
  lineFulfilments: readonly ('delivery' | 'pickup' | 'both' | null)[];
  /** The kinds of order the cart holds. */
  orderTypes: readonly (
    'ready_meat' | 'carcass' | 'cooked' | 'occasion' | 'adha'
  )[];
  /** subtotal − discount + delivery fee, VAT included. */
  total: Money;
}>;
