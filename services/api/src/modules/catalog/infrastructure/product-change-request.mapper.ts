import type { ProductChangeRequest as ProductChangeRequestRow } from '@infra/database/generated/prisma/client';
import type { ProductChangeRequest } from '../domain/product-change-request.type';
import { toProductContent } from './product-content.mapper';

/** A row of `product_change_requests` as the domain's change request (content validated). */
export function toProductChangeRequest(
  row: ProductChangeRequestRow,
): ProductChangeRequest {
  return {
    id: row.id,
    productId: row.productId,
    requestedById: row.requestedById,
    status: row.status,
    content: toProductContent(row.content),
    rejectionReason: row.rejectionReason,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
