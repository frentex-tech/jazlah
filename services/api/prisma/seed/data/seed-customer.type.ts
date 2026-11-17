import type { SeedCustomerAddress } from './seed-customer-address.type';

/**
 * A seeded customer's data beyond the user: the profile (no name: incomplete, so the
 * completion screen shows), saved addresses (exactly one default when any) and the
 * marketing consent history (one entry per change, oldest first).
 */
export type SeedCustomer = Readonly<{
  /** A SeedUser key. */
  user: string;
  fullName: string | null;
  email: string | null;
  preferredLanguage: 'ar' | 'en';
  addresses: readonly SeedCustomerAddress[];
  marketingConsents: readonly boolean[];
}>;
