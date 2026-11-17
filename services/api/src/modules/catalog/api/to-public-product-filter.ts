import { Money } from '@common/money/money';
import type { PublicProductFilter } from '../domain/public-product-filter.type';
import type { ListPublicProductsQueryDto } from './dto/list-public-products-query.dto';

/** A validated public list query as the domain's filter, prices as Money. */
export function toPublicProductFilter(
  query: ListPublicProductsQueryDto,
): PublicProductFilter {
  return {
    ...(query.q === undefined ? {} : { text: query.q }),
    ...(query.categoryId === undefined ? {} : { categoryId: query.categoryId }),
    ...(query.vendorId === undefined ? {} : { vendorId: query.vendorId }),
    ...(query.meatTypeId === undefined ? {} : { meatTypeId: query.meatTypeId }),
    ...(query.minPriceHalalas === undefined
      ? {}
      : { minPrice: Money.of(query.minPriceHalalas) }),
    ...(query.maxPriceHalalas === undefined
      ? {}
      : { maxPrice: Money.of(query.maxPriceHalalas) }),
  };
}
