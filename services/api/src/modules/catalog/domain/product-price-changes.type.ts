import type { Money } from '@common/money/money';

import type { ProductPackaging } from './product-packaging.type';

/**
 * New prices for some of a product's sizes, cutting styles and packagings; the rest keep
 * theirs.
 */
export type ProductPriceChanges = Readonly<{
  sizes: readonly Readonly<{ sizeId: string; price: Money }>[];
  cuttings: readonly Readonly<{ cuttingStyleId: string; extraPrice: Money }>[];
  packagings: readonly Readonly<{
    packaging: ProductPackaging;
    extraPrice: Money;
  }>[];
}>;
