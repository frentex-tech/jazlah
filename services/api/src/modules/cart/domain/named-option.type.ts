import type { LocalizedText } from '@common/i18n/localized-text.type';

/** A named option of a line: a cutting style or a "without" item. */
export type NamedOption = Readonly<{ id: string; name: LocalizedText }>;
