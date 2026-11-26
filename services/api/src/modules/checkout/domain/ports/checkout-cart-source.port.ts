import type { CheckoutCart } from '../checkout-cart.type';

export const CHECKOUT_CART_SOURCE = Symbol('CHECKOUT_CART_SOURCE');

/** The customer's cart, priced now. */
export interface CheckoutCartSource {
  cartOf(userId: string): Promise<CheckoutCart>;
}
