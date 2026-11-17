import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';
import type { SeedProductSize } from './seed-product-size.type';

/**
 * A vendor's pending edit of a published product: new names and description, and one
 * new size after the live ones (a live size keeps its price, as the catalog requires).
 * Everything else is proposed unchanged.
 */
export type SeedProductChange = Readonly<{
  name: LocalizedText;
  description: OptionalLocalizedText;
  newSize: SeedProductSize;
}>;
