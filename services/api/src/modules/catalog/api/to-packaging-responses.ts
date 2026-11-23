import type { ProductPackagingOption } from '../domain/product-packaging-option.type';
import type { ProductPackagingResponseDto } from './dto/product-packaging-response.dto';

/** A product's packagings as the response shape, prices in halalas. */
export function toPackagingResponses(
  packagings: readonly ProductPackagingOption[],
): ProductPackagingResponseDto[] {
  return packagings.map((option) => ({
    packaging: option.packaging,
    extraPriceHalalas: option.extraPrice.halalas,
  }));
}
