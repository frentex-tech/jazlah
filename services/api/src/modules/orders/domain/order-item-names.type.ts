import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OrderOptionSnapshot } from './order-option-snapshot.type';

/** The names of a line as they were when ordered. */
export type OrderItemNames = Readonly<{
  name: LocalizedText;
  size: Readonly<{
    id: string;
    approxWeightGrams: number;
    tag: LocalizedText | null;
  }>;
  cutting: OrderOptionSnapshot | null;
  exclusions: readonly OrderOptionSnapshot[];
}>;
