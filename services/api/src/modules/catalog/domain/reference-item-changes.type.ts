import type { LocalizedText } from '@common/i18n/localized-text.type';

/** An admin's changes to a list entry; what is left out stays as it is. */
export type ReferenceItemChanges = Readonly<{
  name?: LocalizedText;
  isActive?: boolean;
}>;
