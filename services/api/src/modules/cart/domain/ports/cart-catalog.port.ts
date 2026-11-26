import type { LineChoice } from '../line-choice.type';
import type { LineQuote } from '../line-quote.type';

export const CART_CATALOG = Symbol('CART_CATALOG');

/** The catalog as the cart needs it: the authoritative price and display of each choice now. */
export interface CartCatalog {
  /** One quote per item, in the order given. */
  quote(
    items: readonly Readonly<LineChoice & { quantity: number }>[],
  ): Promise<LineQuote[]>;
}
