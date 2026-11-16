import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';

/** A live cutting style of a product, with its name and extra price. */
export type ProductCuttingOption = Readonly<{
  cuttingStyleId: string;
  name: LocalizedText;
  extraPrice: Money;
}>;
