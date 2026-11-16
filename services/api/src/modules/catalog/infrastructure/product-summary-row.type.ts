import type { Prisma } from '@infra/database/generated/prisma/client';
import type { PRODUCT_SUMMARY_SELECT } from './product-summary-select.constants';

/** A product row read with PRODUCT_SUMMARY_SELECT. */
export type ProductSummaryRow = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_SUMMARY_SELECT;
}>;
