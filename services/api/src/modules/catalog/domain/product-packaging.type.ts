import type { PRODUCT_PACKAGINGS } from './product-packagings.constants';

/**
 * A packaging: trays, bags, vacuum or none. A product prices each packaging it offers
 * (ProductPackagingOption).
 */
export type ProductPackaging = (typeof PRODUCT_PACKAGINGS)[number];
