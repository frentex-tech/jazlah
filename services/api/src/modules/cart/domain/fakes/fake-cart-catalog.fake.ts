import { Money } from '@common/money/money';
import type { LineChoice } from '../line-choice.type';
import type { LineQuote } from '../line-quote.type';
import type { LineRefusal } from '../line-refusal.type';
import type { CartCatalog } from '../ports/cart-catalog.port';

/** One product the fake catalog prices: its store, unit price and any refusals. */
type FakeProduct = {
  vendorId: string;
  unitPriceHalalas: number;
  refusals: LineRefusal[];
};

/** CartCatalog in memory: products a test sets by id; an unknown product is PRODUCT_UNAVAILABLE. */
export class FakeCartCatalog implements CartCatalog {
  readonly products = new Map<string, FakeProduct>();

  set(productId: string, product: Partial<FakeProduct>): void {
    this.products.set(productId, {
      vendorId: 'vendor-1',
      unitPriceHalalas: 10_000,
      refusals: [],
      ...this.products.get(productId),
      ...product,
    });
  }

  quote(
    items: readonly Readonly<LineChoice & { quantity: number }>[],
  ): Promise<LineQuote[]> {
    return Promise.resolve(
      items.map((item) => {
        const product = this.products.get(item.productId);
        if (product === undefined) {
          return {
            unitPrice: Money.zero(),
            refusals: ['PRODUCT_UNAVAILABLE'],
            vendorId: null,
            display: null,
            imageUrl: null,
          };
        }
        return {
          unitPrice:
            product.refusals.length === 0
              ? Money.of(product.unitPriceHalalas)
              : Money.zero(),
          refusals: product.refusals,
          vendorId: product.vendorId,
          display: {
            vendorName: { ar: product.vendorId, en: product.vendorId },
            name: { ar: item.productId, en: item.productId },
            size: { id: item.sizeId, approxWeightGrams: 1000, tag: null },
            cutting: null,
            exclusions: [],
          },
          imageUrl: null,
        };
      }),
    );
  }
}
