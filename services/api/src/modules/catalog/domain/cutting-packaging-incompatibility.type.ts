import type { ProductPackaging } from './product-packaging.type';

/** A global rule (FR-PRD-04): this cutting style cannot be packed this way. */
export type CuttingPackagingIncompatibility = Readonly<{
  id: string;
  cuttingStyleId: string;
  packaging: ProductPackaging;
  createdAt: Date;
}>;
