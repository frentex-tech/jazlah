import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';
import type { ProductCuttingInput } from './product-cutting-input.type';
import type { ProductPackaging } from './product-packaging.type';
import type { ProductSizeInput } from './product-size-input.type';

/**
 * Everything about a product that goes through review on a published product: what a
 * vendor writes in one edit. Availability and fulfilment are not part of it (they apply
 * at once); prices are, but on a published product an existing size or cutting keeps
 * its live price (Product.assertKeepsLivePrices). Lists are in display order.
 */
export type ProductContent = Readonly<{
  name: LocalizedText;
  description: OptionalLocalizedText;
  categoryId: string;
  meatTypeId: string | null;
  imageMediaIds: readonly string[];
  sizes: readonly ProductSizeInput[];
  cuttings: readonly ProductCuttingInput[];
  packagings: readonly ProductPackaging[];
  exclusionItemIds: readonly string[];
}>;
