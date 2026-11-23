import type { LocalizedText } from '@common/i18n/localized-text.type';

/** An admin's changes to a list entry; what is left out stays as it is. */
export type ReferenceItemChanges = Readonly<{
  name?: LocalizedText;
  isActive?: boolean;
  /** A category's display order (ORDERED_REFERENCE_LISTS only). */
  sortOrder?: number;
  /** A category's image (categories only): a media id to set, null to clear. */
  imageMediaId?: string | null;
}>;
