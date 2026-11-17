/** What `me` shows of a customer's profile and consent (the customers module keeps them). */
export type CustomerProfileSummary = Readonly<{
  /** Null until the customer gives a name. */
  fullName: string | null;
  /** Null when none was given. */
  email: string | null;
  /** One of the customers module's PREFERRED_LANGUAGES. */
  preferredLanguage: string;
  /** Whether the profile has a full name. */
  isComplete: boolean;
  marketingConsent: Readonly<{ granted: boolean; changedAt: Date | null }>;
}>;
