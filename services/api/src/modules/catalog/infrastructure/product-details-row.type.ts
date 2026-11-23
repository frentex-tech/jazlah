import type { Prisma } from '@infra/database/generated/prisma/client';
import type { PRODUCT_DETAILS_INCLUDE } from './product-details-include.constants';

/** A product row read with PRODUCT_DETAILS_INCLUDE. */
export type ProductDetailsRow = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_DETAILS_INCLUDE;
}>;
