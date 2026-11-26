import type { CheckoutCart } from '../checkout-cart.type';
import type { CheckoutDay } from '../checkout-day.type';

export const CHECKOUT_SCHEDULING = Symbol('CHECKOUT_SCHEDULING');

/** The scheduling engine as checkout needs it. */
export interface CheckoutScheduling {
  /** Every day of the booking horizon for the vendor's cart and the method. */
  availableDays(
    request: Readonly<{
      vendorId: string;
      method: 'delivery' | 'pickup';
      orderTypes: CheckoutCart['orderTypes'];
    }>,
  ): Promise<CheckoutDay[]>;
}
