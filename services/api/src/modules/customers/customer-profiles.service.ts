import { Inject, Injectable } from '@nestjs/common';
import { DbContext } from '@infra/database/db-context';
import type { CustomerProfile as CustomerProfileRow } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { UsersService } from '@modules/users';
import type { CustomerAccounts } from './customer-accounts.type';
import type { CustomerProfile } from './customer-profile.type';
import type { CustomerProfileChanges } from './customer-profile-changes.type';
import { lockCustomer } from './lock-customer';

/** The profile of a customer who never saved one. */
const NO_PROFILE: CustomerProfile = {
  fullName: null,
  email: null,
  preferredLanguage: 'ar',
  isComplete: false,
};

/**
 * Customers' profiles (table `customer_profiles`, FR-ACC-02): a full name, an optional
 * email (stored lowercase, not verified, possibly shared by two accounts) and the
 * preferred language. One row per customer, created at the first save; a customer
 * without one has the defaults (NO_PROFILE). Complete once it has a full name.
 *
 * Writes lock the user's row first (lockCustomer), like every write to what a customer
 * keeps, so a save never lands on a deleted account.
 */
@Injectable()
export class CustomerProfilesService {
  constructor(
    private readonly db: DbContext,
    @Inject(UsersService) private readonly accounts: CustomerAccounts,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  /**
   * The customer's profile, or the defaults when none was saved. A read only: the
   * caller has checked the user (the auth module's `me` and sign-in).
   */
  async profileOf(userId: string): Promise<CustomerProfile> {
    try {
      const row = await this.db.client.customerProfile.findUnique({
        where: { userId },
      });
      return row === null ? NO_PROFILE : this.toProfile(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  /**
   * Saves changes to the customer's profile, creating it at the first save, and returns
   * it. UNAUTHORIZED for a deleted account, ACCOUNT_DISABLED for a disabled one.
   */
  update(
    userId: string,
    changes: CustomerProfileChanges,
  ): Promise<CustomerProfile> {
    return this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      try {
        return this.toProfile(
          await this.db.client.customerProfile.upsert({
            where: { userId },
            create: { userId, ...changes },
            update: changes,
          }),
        );
      } catch (error) {
        mapPrismaError(error);
      }
    });
  }

  /**
   * Deletes the customer's profile (an account deletion). Database only, inside the
   * caller's transaction, after the user's row is locked.
   */
  async eraseOf(userId: string): Promise<void> {
    try {
      await this.db.client.customerProfile.deleteMany({ where: { userId } });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  private toProfile(row: CustomerProfileRow): CustomerProfile {
    return {
      fullName: row.fullName,
      email: row.email,
      preferredLanguage: row.preferredLanguage,
      isComplete: row.fullName !== null,
    };
  }
}
