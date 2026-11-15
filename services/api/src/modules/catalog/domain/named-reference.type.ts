import type { LocalizedText } from '@common/i18n/localized-text.type';

/** A list entry a product refers to, with its name (a category, a "without" item). */
export type NamedReference = Readonly<{
  id: string;
  name: LocalizedText;
}>;
