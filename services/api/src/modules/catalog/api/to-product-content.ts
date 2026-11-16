import { Money } from '@common/money/money';
import type { ProductContent } from '../domain/product-content.type';
import type { ProductContentDto } from './dto/product-content.dto';

/** A validated content body as the domain's content, amounts as Money. */
export function toProductContent(body: ProductContentDto): ProductContent {
  return {
    name: { ar: body.name.ar, en: body.name.en },
    description: {
      ar: body.description?.ar ?? null,
      en: body.description?.en ?? null,
    },
    categoryId: body.categoryId,
    meatTypeId: body.meatTypeId ?? null,
    imageMediaIds: body.imageMediaIds,
    sizes: body.sizes.map((size) => ({
      id: size.id ?? null,
      approxWeightGrams: size.approxWeightGrams,
      price: Money.of(size.priceHalalas),
      tag: size.tag == null ? null : { ar: size.tag.ar, en: size.tag.en },
    })),
    cuttings: body.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      extraPrice: Money.of(cutting.extraPriceHalalas),
    })),
    packagings: body.packagings,
    exclusionItemIds: body.exclusionItemIds,
  };
}
