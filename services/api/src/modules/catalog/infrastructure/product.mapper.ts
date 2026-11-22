import { Money } from '@common/money/money';
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductSummary } from '../domain/product-summary.type';
import type { ProductDetailsRow } from './product-details-row.type';
import type { ProductSummaryRow } from './product-summary-row.type';

const moneyOrNull = (halalas: number | null): Money | null =>
  halalas === null ? null : Money.of(halalas);

/** A product row with its options as the domain's details. */
export function toProductDetails(row: ProductDetailsRow): ProductDetails {
  return {
    id: row.id,
    vendorId: row.vendorId,
    status: row.status,
    isAvailable: row.isAvailable,
    fulfilment: row.fulfilment,
    name: { ar: row.nameAr, en: row.nameEn },
    description: { ar: row.descriptionAr, en: row.descriptionEn },
    category: {
      id: row.category.id,
      name: { ar: row.category.nameAr, en: row.category.nameEn },
    },
    meatType:
      row.meatType === null
        ? null
        : {
            id: row.meatType.id,
            name: { ar: row.meatType.nameAr, en: row.meatType.nameEn },
          },
    imageMediaIds: row.images.map((image) => image.mediaId),
    sizes: row.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: size.approxWeightGrams,
      price: Money.of(size.priceHalalas),
      tag:
        size.tagAr === null || size.tagEn === null
          ? null
          : { ar: size.tagAr, en: size.tagEn },
      isAvailable: size.isAvailable,
    })),
    cuttings: row.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      name: {
        ar: cutting.cuttingStyle.nameAr,
        en: cutting.cuttingStyle.nameEn,
      },
      extraPrice: Money.of(cutting.extraPriceHalalas),
    })),
    packagings: row.packagings.map((option) => ({
      packaging: option.packaging,
      extraPrice: Money.of(option.extraPriceHalalas),
    })),
    exclusions: row.exclusions.map((exclusion) => ({
      id: exclusion.exclusionItemId,
      name: {
        ar: exclusion.exclusionItem.nameAr,
        en: exclusion.exclusionItem.nameEn,
      },
    })),
    minPrice: moneyOrNull(row.minPriceHalalas),
    rejectionReason: row.rejectionReason,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** A product list row as the domain's summary. */
export function toProductSummary(row: ProductSummaryRow): ProductSummary {
  return {
    id: row.id,
    vendorId: row.vendorId,
    categoryId: row.categoryId,
    meatTypeId: row.meatTypeId,
    status: row.status,
    isAvailable: row.isAvailable,
    name: { ar: row.nameAr, en: row.nameEn },
    minPrice: moneyOrNull(row.minPriceHalalas),
    coverMediaId: row.images[0]?.mediaId ?? null,
    createdAt: row.createdAt,
  };
}
