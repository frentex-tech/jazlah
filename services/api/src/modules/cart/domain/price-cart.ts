import { Money } from '@common/money/money';
import { VAT_IN_GROSS } from '@common/money/vat.constants';
import type { Cart } from './cart.entity';
import type { CartIssue } from './cart-issue.type';
import type { CartPricingRules } from './cart-pricing-rules.type';
import type { LineQuote } from './line-quote.type';
import { orderTypesOf } from './order-types-of';
import type { PricedCart } from './priced-cart.type';
import type { PricedCartLine } from './priced-cart-line.type';

/**
 * A saved cart priced now (FR-CRT-01, 03), from today's quote of each line (same order):
 *
 * - a line is available when its quote has no refusal; otherwise ITEM_UNAVAILABLE;
 * - an available line whose price today differs from the accepted one: PRICE_CHANGED;
 * - subtotal = Σ accepted unit price × quantity; discount 0 (coupons: CRT-API-3);
 *   total = subtotal − discount + delivery fee; VAT = round half up of total × 15 / 115;
 * - the minimum compares the subtotal before any discount;
 * - checkout needs lines, no issue and the minimum reached.
 */
export function priceCart(
  cart: Cart,
  quotes: readonly LineQuote[],
  rules: CartPricingRules,
): PricedCart {
  const issues: CartIssue[] = [];
  const lines: PricedCartLine[] = cart.lines.map((line, index) => {
    const quote = quotes[index];
    const id = line.id ?? '';
    const isAvailable =
      quote !== undefined &&
      quote.refusals.length === 0 &&
      quote.display !== null;
    if (!isAvailable) {
      issues.push({ code: 'ITEM_UNAVAILABLE', lineId: id });
    } else if (!quote.unitPrice.equals(line.unitPrice)) {
      issues.push({
        code: 'PRICE_CHANGED',
        lineId: id,
        oldUnitPrice: line.unitPrice,
        newUnitPrice: quote.unitPrice,
      });
    }
    return {
      id,
      line,
      display: quote?.display ?? line.display,
      imageUrl: quote?.imageUrl ?? null,
      isAvailable,
      fulfilment: quote?.fulfilment ?? null,
      total: line.unitPrice.multiply(line.quantity),
    };
  });
  const subtotal = Money.sum(lines.map((line) => line.total));
  const discount = Money.zero();
  const deliveryFee = lines.length === 0 ? Money.zero() : rules.deliveryFee;
  const total = subtotal.subtract(discount).add(deliveryFee);
  const shortBy = rules.minOrder.subtract(subtotal);
  const minOrderRemaining = shortBy.isGreaterThan(Money.zero())
    ? shortBy
    : Money.zero();
  return {
    vendorId: cart.vendorId,
    vendorName:
      lines.find((line) => line.isAvailable)?.display.vendorName ??
      lines[0]?.display.vendorName ??
      null,
    lines,
    subtotal,
    discount,
    deliveryFee,
    total,
    vat: total.multiplyByFraction(
      VAT_IN_GROSS.numerator,
      VAT_IN_GROSS.denominator,
    ),
    minOrder: rules.minOrder,
    minOrderRemaining,
    issues,
    fulfilment: rules.fulfilment,
    orderTypes: orderTypesOf(cart),
    canCheckout:
      lines.length > 0 &&
      issues.length === 0 &&
      minOrderRemaining.equals(Money.zero()),
  };
}
