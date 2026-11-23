import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { CuttingPackagingIncompatibility } from '../domain/cutting-packaging-incompatibility.type';
import type { ProductDetails } from '../domain/product-details.type';

/** A product as the public reads it: live, its image URLs and its vendor's name. */
export type PublicProductView = Readonly<{
  product: ProductDetails;
  imageUrls: ReadonlyMap<string, string>;
  /** Null only if the vendor could not be found. */
  vendorName: LocalizedText | null;
  /** The global rules among the cutting styles and packagings this product offers. */
  incompatiblePairs: readonly Pick<
    CuttingPackagingIncompatibility,
    'cuttingStyleId' | 'packaging'
  >[];
}>;
