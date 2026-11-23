import { Money } from '@common/money/money';
import type { ProductContent } from '../domain/product-content.type';
import { STORED_PRODUCT_CONTENT } from './stored-product-content.schema';
import type { StoredProductContent } from './stored-product-content.type';

/** ProductContent as stored JSON (amounts as whole halalas). */
export function toStoredProductContent(
  content: ProductContent,
): StoredProductContent {
  return {
    name: content.name,
    description: content.description,
    categoryId: content.categoryId,
    meatTypeId: content.meatTypeId,
    imageMediaIds: [...content.imageMediaIds],
    sizes: content.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: size.approxWeightGrams,
      priceHalalas: size.price.halalas,
      tag: size.tag,
    })),
    cuttings: content.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      extraPriceHalalas: cutting.extraPrice.halalas,
    })),
    packagings: content.packagings.map((option) => ({
      packaging: option.packaging,
      extraPriceHalalas: option.extraPrice.halalas,
    })),
    exclusionItemIds: [...content.exclusionItemIds],
  };
}

/** Stored JSON back as ProductContent, validated (throws on a row that does not match). */
export function toProductContent(json: unknown): ProductContent {
  const stored = STORED_PRODUCT_CONTENT.parse(json);
  return {
    ...stored,
    sizes: stored.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: size.approxWeightGrams,
      price: Money.of(size.priceHalalas),
      tag: size.tag,
    })),
    cuttings: stored.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      extraPrice: Money.of(cutting.extraPriceHalalas),
    })),
    packagings: stored.packagings.map((option) => ({
      packaging: option.packaging,
      extraPrice: Money.of(option.extraPriceHalalas),
    })),
  };
}
