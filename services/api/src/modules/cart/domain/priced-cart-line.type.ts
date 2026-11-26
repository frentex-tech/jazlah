import type { Money } from '@common/money/money';
import type { CartLine } from './cart-line.type';
import type { LineDisplay } from './line-display.type';
import type { LineFulfilment } from './line-fulfilment.type';

/** A saved line as the cart shows it now. */
export type PricedCartLine = Readonly<{
  id: string;
  line: CartLine;
  /** Today's display when the public can see it, else the one kept with the line. */
  display: LineDisplay;
  imageUrl: string | null;
  isAvailable: boolean;
  /** How the product may be fulfilled now; null when the public cannot see it. */
  fulfilment: LineFulfilment | null;
  /** The accepted unit price × quantity. */
  total: Money;
}>;
