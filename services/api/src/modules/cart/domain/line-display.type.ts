import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { NamedOption } from './named-option.type';

/**
 * What a line shows: its store, product name, size and chosen options with their names.
 * Kept with the line as last priced, so a line whose product the public can no longer
 * see still shows what it was.
 */
export type LineDisplay = Readonly<{
  /** Null only if the store could not be found. */
  vendorName: LocalizedText | null;
  name: LocalizedText;
  size: Readonly<{
    id: string;
    approxWeightGrams: number;
    tag: LocalizedText | null;
  }>;
  cutting: NamedOption | null;
  exclusions: readonly NamedOption[];
}>;
