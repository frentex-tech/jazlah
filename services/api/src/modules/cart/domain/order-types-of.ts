import type { Cart } from './cart.entity';
import type { CartOrderType } from './cart-order-type.type';

/**
 * The kinds of order a cart holds, which decide its cut-offs and capacity.
 *
 * ASSUMPTION (2026-11-26, backend owner, DECISIONS.md "Sprint 3 order"): catalog
 * products carry no order type yet, so every cart is `ready_meat` in Sprint 3 and no
 * carcass capacity is counted. Products get an order type after November 30: it
 * changes only this function.
 */
export function orderTypesOf(cart: Cart): CartOrderType[] {
  return cart.lines.length === 0 ? [] : ['ready_meat'];
}
