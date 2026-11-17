import type { CustomerProfileSummary } from '../customer-profile-summary.type';
import type { CustomerProfiles } from '../ports/customer-profiles.port';

/** CustomerProfiles in memory: the defaults, unless a test names the customer. */
export class InMemoryCustomerProfiles implements CustomerProfiles {
  private readonly names = new Map<string, string>();

  /** Gives the customer a full name: their profile is then complete. */
  name(userId: string, fullName: string): void {
    this.names.set(userId, fullName);
  }

  summaryOf(userId: string): Promise<CustomerProfileSummary> {
    const fullName = this.names.get(userId) ?? null;
    return Promise.resolve({
      fullName,
      email: null,
      preferredLanguage: 'ar',
      isComplete: fullName !== null,
      marketingConsent: { granted: false, changedAt: null },
    });
  }

  isComplete(userId: string): Promise<boolean> {
    return Promise.resolve(this.names.has(userId));
  }
}
