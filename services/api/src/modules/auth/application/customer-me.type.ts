import type { CustomerProfileSummary } from '../domain/customer-profile-summary.type';
import type { CurrentUserProfile } from './current-user-profile.type';

/** The signed-in customer: who they are, their own phone, their profile and consent. */
export type CustomerMe = CurrentUserProfile &
  Readonly<{ profile: CustomerProfileSummary }>;
