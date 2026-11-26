import { Money } from '@common/money/money';
import { VAT_IN_GROSS } from '@common/money/vat.constants';
import type { NewOrderLine } from './new-order-line.type';
import type { PricedOrder } from './priced-order.type';

/**
 * The money of an order (FR-CRT-03): subtotal = sum of unit price x quantity; no discount
 * yet (coupons come after November 30); total = subtotal - discount + delivery fee;
 * VAT = round half up of total x 15 / 115. The same arithmetic as the priced cart, so
 * the order total equals the total the customer saw.
 */
export function priceOrder(
  lines: readonly NewOrderLine[],
  deliveryFee: Money,
): PricedOrder {
  const subtotal = Money.sum(
    lines.map((line) => line.unitPrice.multiply(line.quantity)),
  );
  const discount = Money.zero();
  const total = subtotal.subtract(discount).add(deliveryFee);
  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    vat: total.multiplyByFraction(
      VAT_IN_GROSS.numerator,
      VAT_IN_GROSS.denominator,
    ),
  };
}
