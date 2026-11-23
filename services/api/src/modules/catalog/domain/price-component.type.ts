import type { Money } from '@common/money/money';

/** One priced part of a line's unit price: the size, the cutting style or the packaging. */
export type PriceComponent = Readonly<{
  kind: 'size' | 'cutting' | 'packaging';
  /** The size id, the cutting style id or the packaging name. */
  optionId: string;
  amount: Money;
}>;
