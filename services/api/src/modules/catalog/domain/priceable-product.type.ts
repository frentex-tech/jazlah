import type { CuttingPackagingIncompatibility } from './cutting-packaging-incompatibility.type';
import type { ProductDetails } from './product-details.type';

/** What pricing a line reads of a product: its options and the rules among them. */
export type PriceableProduct = Pick<
  ProductDetails,
  'isAvailable' | 'sizes' | 'cuttings' | 'packagings' | 'exclusions'
> &
  Readonly<{
    incompatiblePairs: readonly Pick<
      CuttingPackagingIncompatibility,
      'cuttingStyleId' | 'packaging'
    >[];
  }>;
