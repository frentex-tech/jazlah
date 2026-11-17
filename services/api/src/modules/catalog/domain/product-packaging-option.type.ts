import type { Money } from '@common/money/money';
import type { ProductPackaging } from './product-packaging.type';

/**
 * A packaging a product offers, with its extra price (zero when none). Its price follows
 * a cutting style's rules: set at creation, changed through the prices edit only.
 */
export type ProductPackagingOption = Readonly<{
  packaging: ProductPackaging;
  extraPrice: Money;
}>;
