import type { ProductChangeRequestStatus } from './product-change-request-status.type';
import type { ProductContent } from './product-content.type';

/** A vendor's edit of a published product, waiting for an admin or reviewed. */
export type ProductChangeRequest = Readonly<{
  id: string;
  productId: string;
  requestedById: string;
  status: ProductChangeRequestStatus;
  content: ProductContent;
  /** The admin's reason; null unless rejected. */
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;
