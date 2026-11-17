import type { CustomerProfileSummary } from '../customer-profile-summary.type';

/** Injection token of the CustomerProfiles port. */
export const CUSTOMER_PROFILES = Symbol('CUSTOMER_PROFILES');

/** A customer's profile, as signing in and `me` show it (the customers module's data). */
export interface CustomerProfiles {
  /** The profile and the marketing consent; the defaults when none was saved. */
  summaryOf(userId: string): Promise<CustomerProfileSummary>;

  /** Whether the profile is complete (has a full name). */
  isComplete(userId: string): Promise<boolean>;
}
