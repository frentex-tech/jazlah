import type { LocalizedText } from '@common/i18n/localized-text.type';

/** A new entry of an admin list; `sortOrder` for a category only (0 when left out). */
export type NewReferenceItem = Readonly<{
  name: LocalizedText;
  sortOrder?: number;
}>;
