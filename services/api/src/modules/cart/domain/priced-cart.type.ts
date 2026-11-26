import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';
import type { CartIssue } from './cart-issue.type';
import type { CartOrderType } from './cart-order-type.type';
import type { PricedFulfilment } from './priced-fulfilment.type';
import type { PricedCartLine } from './priced-cart-line.type';

/** A cart priced now: its lines, totals (VAT included), minimum order and what blocks checkout. */
export type PricedCart = Readonly<{
  vendorId: string | null;
  vendorName: LocalizedText | null;
  lines: readonly PricedCartLine[];
  subtotal: Money;
  discount: Money;
  deliveryFee: Money;
  total: Money;
  vat: Money;
  minOrder: Money;
  minOrderRemaining: Money;
  issues: readonly CartIssue[];
  /** Null until chosen. */
  fulfilment: PricedFulfilment | null;
  /** The kinds of order the cart holds (`orderTypesOf`); empty for an empty cart. */
  orderTypes: readonly CartOrderType[];
  canCheckout: boolean;
}>;
