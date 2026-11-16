import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';

/**
 * A size as written in a product's content: an existing size of the product (`id`) or a
 * new one (`id` null). The order of the sizes is their display order.
 */
export type ProductSizeInput = Readonly<{
  id: string | null;
  approxWeightGrams: number;
  price: Money;
  tag: LocalizedText | null;
}>;
