import { Inject, Injectable } from '@nestjs/common';
import { DbContext } from '@infra/database/db-context';
import type { ConsentRecord } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { UsersService } from '@modules/users';
import type { CustomerAccounts } from './customer-accounts.type';
import { lockCustomer } from './lock-customer';
import type { MarketingConsent } from './marketing-consent.type';

/**
 * Customers' marketing consent (NFR-PRV): an append-only history in `consent_records`
 * (kind `marketing`), one row per change, never updated or deleted, so a consent can be
 * proven later. The current state is the row with the highest sequence; sequences are
 * 1, 2, 3… per customer, given under the lock on the user's row (unique index
 * `consent_records_user_id_kind_sequence_key` as the backstop), so the order never
 * depends on two servers' clocks. Marketing is opt-in: no record means not granted.
 */
@Injectable()
export class MarketingConsentsService {
  constructor(
    private readonly db: DbContext,
    @Inject(UsersService) private readonly accounts: CustomerAccounts,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  /** The customer's current consent. A read only: the caller has checked the user. */
  async currentOf(userId: string): Promise<MarketingConsent> {
    return this.toConsent(await this.latestOf(userId));
  }

  /**
   * Grants or withdraws the customer's consent: a new record, unless it is already in
   * that state (then nothing is written). Returns the current consent. UNAUTHORIZED for a
   * deleted account, ACCOUNT_DISABLED for a disabled one.
   */
  set(userId: string, granted: boolean): Promise<MarketingConsent> {
    return this.transactions.run(async () => {
      await lockCustomer(this.accounts, userId);
      return this.toConsent(await this.record(userId, granted, 'customer'));
    });
  }

  /**
   * Ends the history withdrawn when the account is deleted: a withdrawal record if the
   * consent is granted, nothing otherwise. The history itself is kept (it names only the
   * deleted account's id). Database only, inside the caller's transaction, after the
   * user's row is locked.
   */
  async withdrawForDeletion(userId: string): Promise<void> {
    await this.record(userId, false, 'account_deletion');
  }

  /** Appends a record when the state changes; returns the latest record either way. */
  private async record(
    userId: string,
    granted: boolean,
    source: ConsentRecord['source'],
  ): Promise<ConsentRecord | null> {
    const latest = await this.latestOf(userId);
    if ((latest?.granted ?? false) === granted) {
      return latest;
    }
    try {
      return await this.db.client.consentRecord.create({
        data: {
          userId,
          kind: 'marketing',
          granted,
          sequence: (latest?.sequence ?? 0) + 1,
          source,
        },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  private async latestOf(userId: string): Promise<ConsentRecord | null> {
    try {
      return await this.db.client.consentRecord.findFirst({
        where: { userId, kind: 'marketing' },
        orderBy: { sequence: 'desc' },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  private toConsent(record: ConsentRecord | null): MarketingConsent {
    return record === null
      ? { granted: false, changedAt: null }
      : { granted: record.granted, changedAt: record.createdAt };
  }
}
