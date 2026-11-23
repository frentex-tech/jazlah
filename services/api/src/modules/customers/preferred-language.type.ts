import type { PREFERRED_LANGUAGES } from './preferred-languages.constants';

/** The language a customer wants messages in (FR-ACC-02); `ar` until they choose. */
export type PreferredLanguage = (typeof PREFERRED_LANGUAGES)[number];
