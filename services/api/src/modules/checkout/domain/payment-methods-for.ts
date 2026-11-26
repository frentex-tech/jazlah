import type { CheckoutCart } from './checkout-cart.type';
import type { CodRules } from './cod-rules.type';
import type { PaymentMethodOption } from './payment-method-option.type';

/**
 * The methods a cart can be paid with, in display order (FR-PAY-01, cash on delivery
 * first: DECISIONS.md "Sprint 3 order"). Cash on delivery is listed when it is on, the
 * total is within its cap (none: no cap) and every kind of order of the cart allows
 * it; otherwise it is left out. Online methods and the wallet come after November 30
 * and are not listed yet.
 */
export function paymentMethodsFor(
  cart: CheckoutCart,
  cod: CodRules,
): PaymentMethodOption[] {
  const codAllowed =
    cod.enabled &&
    (cod.maxOrder === null || !cart.total.isGreaterThan(cod.maxOrder)) &&
    cart.orderTypes.every((type) => cod.allowedOrderTypes.includes(type));
  return codAllowed ? [{ method: 'cod', isAvailable: true, reason: null }] : [];
}
