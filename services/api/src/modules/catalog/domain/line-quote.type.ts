import type { PricedLine } from './priced-line.type';
import type { QuotedProduct } from './quoted-product.type';

/** A line priced now with what it shows; `product` is null when the public cannot see it (PRODUCT_UNAVAILABLE). */
export type LineQuote = Readonly<{
  priced: PricedLine;
  product: QuotedProduct | null;
}>;
