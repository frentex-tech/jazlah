import type { PreferredLanguage } from './preferred-language.type';

/**
 * A customer's profile. A customer who never saved one has the defaults: no name, no
 * email, Arabic.
 */
export type CustomerProfile = Readonly<{
  /** Null until the customer gives a name. */
  fullName: string | null;
  /** Lowercase; null when none was given. Not verified. */
  email: string | null;
  preferredLanguage: PreferredLanguage;
  /**
   * Whether the profile is complete: it has a full name (the email and the language do
   * not count). The app may be used without it; placing an order will require it.
   */
  isComplete: boolean;
}>;
