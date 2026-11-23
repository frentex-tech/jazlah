import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';

/** A live size of a product (FR-PRD-02): an approximate weight, its price, an optional tag. */
export type ProductSize = Readonly<{
  id: string;
  approxWeightGrams: number;
  price: Money;
  /** "Enough for an aqiqah"; null when the size has none. */
  tag: LocalizedText | null;
  /** Whether this size can be ordered now (out of stock when false). */
  isAvailable: boolean;
}>;
