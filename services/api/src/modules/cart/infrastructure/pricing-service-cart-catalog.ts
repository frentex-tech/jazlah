import { Injectable } from '@nestjs/common';
import {
  PRODUCT_PACKAGINGS,
  PricingService,
  type LineQuote as CatalogLineQuote,
} from '@modules/catalog';
import type { LineChoice } from '../domain/line-choice.type';
import type { LineQuote } from '../domain/line-quote.type';
import type { CartCatalog } from '../domain/ports/cart-catalog.port';

type Packaging = (typeof PRODUCT_PACKAGINGS)[number];

/**
 * `CartCatalog` on the catalog's `PricingService.quoteLines`: the catalog's line errors
 * are the cart's refusals by the same names (`PRICE_LINE_ERRORS`, `LINE_REFUSALS`).
 */
@Injectable()
export class PricingServiceCartCatalog implements CartCatalog {
  constructor(private readonly pricing: PricingService) {}

  async quote(
    items: readonly Readonly<LineChoice & { quantity: number }>[],
  ): Promise<LineQuote[]> {
    const quotes = await this.pricing.quoteLines(
      items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        cuttingStyleId: item.cuttingStyleId,
        packaging: toPackaging(item.packaging),
        exclusionItemIds: item.exclusionItemIds,
        quantity: item.quantity,
      })),
    );
    return quotes.map(toCartQuote);
  }
}

function toCartQuote({ priced, product }: CatalogLineQuote): LineQuote {
  const size = product?.size ?? null;
  return {
    unitPrice: priced.unitPrice,
    refusals: priced.errors,
    vendorId: product?.vendorId ?? null,
    display:
      product === null || size === null
        ? null
        : {
            vendorName: product.vendorName,
            name: product.name,
            size,
            cutting: product.cutting,
            exclusions: product.exclusions,
          },
    imageUrl: product?.imageUrl ?? null,
    fulfilment: product?.fulfilment ?? null,
  };
}

/** The catalog's packaging of a name the request DTO allowed. */
function toPackaging(name: string | null): Packaging | null {
  if (name === null) {
    return null;
  }
  const found = PRODUCT_PACKAGINGS.find((packaging) => packaging === name);
  if (found === undefined) {
    throw new RangeError(`Not a packaging: ${name}`);
  }
  return found;
}
