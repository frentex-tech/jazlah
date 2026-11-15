import type { Money } from '@common/money/money';

/**
 * The public product list's filters (FR-CAT-03), each optional. The price range applies
 * to the lowest size price, both ends included.
 */
export type PublicProductFilter = Readonly<{
  categoryId?: string;
  vendorId?: string;
  meatTypeId?: string;
  minPrice?: Money;
  maxPrice?: Money;
}>;
