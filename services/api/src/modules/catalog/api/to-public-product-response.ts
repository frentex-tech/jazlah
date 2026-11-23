import { toPackagingResponses } from './to-packaging-responses';
import type { PublicProductView } from '../application/public-product-view.type';
import type { PublicProductResponseDto } from './dto/public-product-response.dto';
import { toImageResponses } from './to-image-responses';

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
    isAvailable: product.isAvailable,
    images: toImageResponses(product.imageMediaIds, view.imageUrls),
    sizes: product.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: size.approxWeightGrams,
      priceHalalas: size.price.halalas,
      tag: size.tag,
      isAvailable: size.isAvailable,
    })),
    defaultSizeId: product.sizes.find((size) => size.isAvailable)?.id ?? null,
    cuttings: product.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      name: cutting.name,
      extraPriceHalalas: cutting.extraPrice.halalas,
    })),
    packagings: toPackagingResponses(product.packagings),
    exclusions: [...product.exclusions],
    incompatiblePairs: [...view.incompatiblePairs],
    minPriceHalalas: product.minPrice.halalas,
  };
}
