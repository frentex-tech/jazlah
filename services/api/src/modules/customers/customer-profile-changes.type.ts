import type { PreferredLanguage } from './preferred-language.type';

/** Changes to a profile; a field left out stays as it is. */
export type CustomerProfileChanges = Readonly<{
  fullName?: string;
  /** Null removes the email. */
  email?: string | null;
  preferredLanguage?: PreferredLanguage;
}>;
