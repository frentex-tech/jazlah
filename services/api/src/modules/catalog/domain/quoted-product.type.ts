import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { NamedReference } from './named-reference.type';
import type { ProductFulfilment } from './product-fulfilment.type';
import type { ProductSize } from './product-size.type';

/**
 * What a line shows of its product as the public sees it now: the store, names, first
 * image, how it is fulfilled, and the chosen options with their names (null or left out
 * when the product no longer offers them).
 */
export type QuotedProduct = Readonly<{
  id: string;
  vendorId: string;
  /** Null only if the vendor could not be found. */
  vendorName: LocalizedText | null;
  name: LocalizedText;
  /** Null when it has no ready image. */
  imageUrl: string | null;
  fulfilment: ProductFulfilment;
  /** Null when the product no longer offers the chosen size. */
  size: Pick<ProductSize, 'id' | 'approxWeightGrams' | 'tag'> | null;
  /** Null when none is chosen or the product no longer offers it. */
  cutting: NamedReference | null;
  /** The chosen "without" items the product still offers. */
  exclusions: readonly NamedReference[];
}>;
