import type { Money } from '@common/money/money';
import type { PriceComponent } from './price-component.type';
import type { PriceLineError } from './price-line-error.type';

/**
 * A priced product line. With an error other than OPTION_REQUIRED the line cannot be
 * bought, and its prices are zero with no breakdown.
 */
export type PricedLine = Readonly<{
  unitPrice: Money;
  lineTotal: Money;
  breakdown: readonly PriceComponent[];
  /** Each at most once, in the order checked; empty when the line can be bought. */
  errors: readonly PriceLineError[];
}>;
