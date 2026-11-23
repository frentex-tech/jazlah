import type { LocalizedText } from '@common/i18n/localized-text.type';

/**
 * A size of a seeded product: approximate weight, price in halalas (VAT included),
 * optional tag, and whether it can be ordered (left out: available).
 */
export type SeedProductSize = Readonly<{
  approxWeightGrams: number;
  priceHalalas: number;
  tag: LocalizedText | null;
  isAvailable?: boolean;
}>;
