import type { ProductStatus } from './product-status.type';

/**
 * A status change the repository records with its timestamps: going to review sets
 * `submittedAt` and clears the rejection reason; publishing sets `publishedAt`; an
 * admin's decision sets `reviewedAt` and the reviewer.
 */
export type ProductTransition = Readonly<{
  to: ProductStatus;
  /** The admin deciding; null for a vendor submitting. */
  reviewerId: string | null;
  /** Set exactly when the product is rejected. */
  rejectionReason: string | null;
}>;
