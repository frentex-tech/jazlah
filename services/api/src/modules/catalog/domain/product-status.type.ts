import type { PRODUCT_STATUSES } from './product-statuses.constants';

/** Where a product is in its review; changes only through ProductStatusMachine. */
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
