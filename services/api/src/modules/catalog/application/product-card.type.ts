import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { ProductSummary } from '../domain/product-summary.type';

/** A product in a list, with its cover image's URL and its vendor's name. */
export type ProductCard = Readonly<{
  summary: ProductSummary;
  /** Null while the product has no image. */
  coverUrl: string | null;
  /** Null only if the vendor could not be found. */
  vendorName: LocalizedText | null;
}>;
