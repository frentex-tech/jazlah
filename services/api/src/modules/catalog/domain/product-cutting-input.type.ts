import type { Money } from '@common/money/money';

/** A cutting style a product offers, with its extra price (zero when none). */
export type ProductCuttingInput = Readonly<{
  cuttingStyleId: string;
  extraPrice: Money;
}>;
