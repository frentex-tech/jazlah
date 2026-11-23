import type { Prisma } from '@infra/database/generated/prisma/client';
import { PACKAGING_EXTRA_PRICES } from './data/packaging-extra-prices.constants';
import type { SeedProduct } from './data/seed-product.type';
import type { SeedProductChange } from './data/seed-product-change.type';
import { productSizeId } from './product-size-id';
import { seedId } from './seed-id';

/**
 * The `content` of a pending change request on a seeded product, in the catalog's stored
 * shape (ProductContent as JSON, amounts in halalas): the change's names and
 * description, the live sizes by id with their live prices, the new size (id null)
 * after them, and the rest of the product as it is. `seed-data.spec.ts` parses it with
 * the catalog's own schema.
 */
export function buildChangeContent(
  product: SeedProduct,
  change: SeedProductChange,
  imageMediaIds: readonly string[],
): Prisma.InputJsonObject {
  return {
    name: change.name,
    description: change.description,
    categoryId: seedId(`category:${product.category}`),
    meatTypeId:
      product.meatType === null
        ? null
        : seedId(`meat-type:${product.meatType}`),
    imageMediaIds: [...imageMediaIds],
    sizes: [
      ...product.sizes.map((size, position) => ({
        id: productSizeId(product.key, position),
        approxWeightGrams: size.approxWeightGrams,
        priceHalalas: size.priceHalalas,
        tag: size.tag,
      })),
      {
        id: null,
        approxWeightGrams: change.newSize.approxWeightGrams,
        priceHalalas: change.newSize.priceHalalas,
        tag: change.newSize.tag,
      },
    ],
    cuttings: product.cuttings.map((cutting) => ({
      cuttingStyleId: seedId(`cutting-style:${cutting.style}`),
      extraPriceHalalas: cutting.extraPriceHalalas,
    })),
    packagings: product.packagings.map((packaging) => ({
      packaging,
      extraPriceHalalas: PACKAGING_EXTRA_PRICES[packaging],
    })),
    exclusionItemIds: product.exclusions.map((key) =>
      seedId(`exclusion-item:${key}`),
    ),
  };
}
