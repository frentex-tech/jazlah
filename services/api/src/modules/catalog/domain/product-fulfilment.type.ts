import type { PRODUCT_FULFILMENTS } from './product-fulfilments.constants';

/** How a product reaches the customer: delivery only, pickup only, or both. */
export type ProductFulfilment = (typeof PRODUCT_FULFILMENTS)[number];
