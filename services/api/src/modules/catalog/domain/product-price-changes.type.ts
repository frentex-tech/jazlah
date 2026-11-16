import type { Money } from '@common/money/money';

/** New prices for some of a product's sizes and cutting styles; the rest keep theirs. */
export type ProductPriceChanges = Readonly<{
  sizes: readonly Readonly<{ sizeId: string; price: Money }>[];
  cuttings: readonly Readonly<{ cuttingStyleId: string; extraPrice: Money }>[];
}>;
