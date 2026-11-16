import type { PublicProductView } from '../application/public-product-view.type';
import type { PublicProductResponseDto } from './dto/public-product-response.dto';
import { toImageResponses } from './to-image-responses';
import { toProductOptionsResponse } from './to-product-options-response';

/** A public product page. A public product always has a size, so a lowest price. */
export function toPublicProductResponse(
  view: PublicProductView,
): PublicProductResponseDto {
  const { product } = view;
  if (product.minPrice === null) {
    throw new Error(`Public product ${product.id} has no size`);
  }
  return {
    id: product.id,
    vendor: { id: product.vendorId, name: view.vendorName },
    name: product.name,
    description: product.description,
    category: product.category,
    meatType: product.meatType,
    fulfilment: product.fulfilment,
    images: toImageResponses(product.imageMediaIds, view.imageUrls),
    ...toProductOptionsResponse(product),
    packagings: [...product.packagings],
    exclusions: [...product.exclusions],
    minPriceHalalas: product.minPrice.halalas,
  };
}
