import { Money } from '@common/money/money';
import type { ProductPriceChanges } from '../domain/product-price-changes.type';
import type { ChangeProductPricesDto } from './dto/change-product-prices.dto';

/** A validated prices body as the domain's changes, amounts as Money. */
export function toPriceChanges(
  body: ChangeProductPricesDto,
): ProductPriceChanges {
  return {
    sizes: (body.sizes ?? []).map((size) => ({
      sizeId: size.sizeId,
      price: Money.of(size.priceHalalas),
    })),
    cuttings: (body.cuttings ?? []).map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      extraPrice: Money.of(cutting.extraPriceHalalas),
    })),
    packagings: (body.packagings ?? []).map((option) => ({
      packaging: option.packaging,
      extraPrice: Money.of(option.extraPriceHalalas),
    })),
  };
}
