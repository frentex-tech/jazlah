/** A customer's current marketing consent: the latest record of their history. */
export type MarketingConsent = Readonly<{
  /** False until the customer grants it (opt-in). */
  granted: boolean;
  /** When the current state was recorded; null when the customer never chose. */
  changedAt: Date | null;
}>;
