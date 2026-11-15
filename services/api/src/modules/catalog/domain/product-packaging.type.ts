import type { PRODUCT_PACKAGINGS } from './product-packagings.constants';

/** A packaging: trays, bags, vacuum or none. It has no price. */
export type ProductPackaging = (typeof PRODUCT_PACKAGINGS)[number];
