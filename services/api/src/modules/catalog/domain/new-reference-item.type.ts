import type { LocalizedText } from '@common/i18n/localized-text.type';

/**
 * A new entry of an admin list; `sortOrder` (0 when left out) and `imageMediaId` (none
 * when left out or null) for a category only.
 */
export type NewReferenceItem = Readonly<{
  name: LocalizedText;
  sortOrder?: number;
  imageMediaId?: string | null;
}>;
