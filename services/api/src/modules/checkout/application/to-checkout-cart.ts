import type { PricedCart } from '@modules/cart';
import type { CheckoutCart } from '../domain/checkout-cart.type';

/** The priced cart as the checkout rules read it. */
export function toCheckoutCart(cart: PricedCart): CheckoutCart {
  return {
    vendorId: cart.vendorId,
    lineFulfilments: cart.lines.map((line) => line.fulfilment),
    orderTypes: cart.orderTypes,
    total: cart.total,
  };
}
