import type { Money } from '@common/money/money';
import type { LineChoice } from './line-choice.type';
import type { LineDisplay } from './line-display.type';

/** One line of a cart: a choice, how many, and the unit price the customer accepted (VAT included). */
export type CartLine = Readonly<{
  /** Null until saved. */
  id: string | null;
  choice: LineChoice;
  quantity: number;
  unitPrice: Money;
  display: LineDisplay;
}>;
