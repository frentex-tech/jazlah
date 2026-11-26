import { Money } from '@common/money/money';
import type { CheckoutCart } from '../checkout-cart.type';
import type { CheckoutCartSource } from '../ports/checkout-cart-source.port';

/** CheckoutCartSource in memory: one cart a test sets; empty by default. */
export class FakeCheckoutCartSource implements CheckoutCartSource {
  cart: CheckoutCart = {
    vendorId: null,
    lineFulfilments: [],
    orderTypes: [],
    total: Money.zero(),
  };

  cartOf(): Promise<CheckoutCart> {
    return Promise.resolve(this.cart);
  }
}
