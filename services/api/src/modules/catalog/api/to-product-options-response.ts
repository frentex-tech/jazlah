import type { ProductDetails } from '../domain/product-details.type';
import type { ProductCuttingResponseDto } from './dto/product-cutting-response.dto';
import type { ProductSizeResponseDto } from './dto/product-size-response.dto';

/** A live product's sizes and cuttings as responses, amounts in halalas. */
export function toProductOptionsResponse(product: ProductDetails): Readonly<{
  sizes: ProductSizeResponseDto[];
  cuttings: ProductCuttingResponseDto[];
}> {
  return {
    sizes: product.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: size.approxWeightGrams,
      priceHalalas: size.price.halalas,
      tag: size.tag,
      isAvailable: size.isAvailable,
    })),
    cuttings: product.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      name: cutting.name,
      extraPriceHalalas: cutting.extraPrice.halalas,
    })),
  };
}
