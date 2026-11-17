import { toPackagingResponses } from './to-packaging-responses';
import type { ProductView } from '../application/product-view.type';
import type { ProductResponseDto } from './dto/product-response.dto';
import { toChangeRequestResponse } from './to-change-request-response';
import { toImageResponses } from './to-image-responses';
import { toProductOptionsResponse } from './to-product-options-response';

/** A product as its vendor or an admin sees it. */
export function toProductResponse(view: ProductView): ProductResponseDto {
  const { product } = view;
  return {
    id: product.id,
    vendorId: product.vendorId,
    status: product.status,
    isAvailable: product.isAvailable,
    fulfilment: product.fulfilment,
    name: product.name,
    description: product.description,
    category: product.category,
    meatType: product.meatType,
    images: toImageResponses(product.imageMediaIds, view.imageUrls),
    ...toProductOptionsResponse(product),
    packagings: toPackagingResponses(product.packagings),
    exclusions: [...product.exclusions],
    minPriceHalalas: product.minPrice?.halalas ?? null,
    rejectionReason: product.rejectionReason,
    submittedAt: product.submittedAt,
    reviewedAt: product.reviewedAt,
    publishedAt: product.publishedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    changeRequest:
      view.changeRequest === null
        ? null
        : toChangeRequestResponse(view.changeRequest, view.imageUrls),
  };
}
