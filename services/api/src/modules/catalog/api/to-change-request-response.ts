import { toPackagingResponses } from './to-packaging-responses';
import type { ProductChangeRequest } from '../domain/product-change-request.type';
import type { ProductChangeRequestResponseDto } from './dto/product-change-request-response.dto';
import { toImageResponses } from './to-image-responses';

/** A change request as a response: its proposed content as written, with image URLs. */
export function toChangeRequestResponse(
  request: ProductChangeRequest,
  imageUrls: ReadonlyMap<string, string>,
): ProductChangeRequestResponseDto {
  const { content } = request;
  return {
    id: request.id,
    productId: request.productId,
    status: request.status,
    content: {
      name: content.name,
      description: content.description,
      categoryId: content.categoryId,
      meatTypeId: content.meatTypeId,
      images: toImageResponses(content.imageMediaIds, imageUrls),
      sizes: content.sizes.map((size) => ({
        id: size.id,
        approxWeightGrams: size.approxWeightGrams,
        priceHalalas: size.price.halalas,
        tag: size.tag,
        isAvailable: null,
      })),
      cuttings: content.cuttings.map((cutting) => ({
        cuttingStyleId: cutting.cuttingStyleId,
        name: null,
        extraPriceHalalas: cutting.extraPrice.halalas,
      })),
      packagings: toPackagingResponses(content.packagings),
      exclusionItemIds: [...content.exclusionItemIds],
    },
    rejectionReason: request.rejectionReason,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    reviewedAt: request.reviewedAt,
  };
}
