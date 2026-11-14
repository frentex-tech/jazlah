import type { Language } from './language.type';

/** One text in every language the API answers in. */
export type LocalizedText = Readonly<Record<Language, string>>;
