import { Injectable } from '@nestjs/common';
import { DbContext } from './db-context';
import type { Prisma } from './generated/prisma/client';
import { IdempotencyOutsideTransactionError } from './idempotency-outside-transaction.error';
import { MissingOutcomeError } from './missing-outcome.error';
import type { StoredOutcome } from './stored-outcome.type';
import { transactionScopeStorage } from './transaction-scope.storage';

/**
 * Runs work that must happen exactly once (a payment webhook, a ledger effect, an SMS
 * that must not be sent twice), keyed in the database inside the transaction that does
 * the work. Use it inside `TransactionRunner.run`:
 *
 *   await this.transactions.run(() =>
 *     this.idempotency.runOnce('payment-webhook', eventId, () => this.payments.capture(...)),
 *   );
 *
 * - **First run:** claims `(operation, key)` in `idempotency_keys`, runs `work`, stores
 *   its result, and returns it. All of it commits with the transaction.
 * - **Repeat** (the key is committed): `work` is not called; the stored result is
 *   returned, as JSON gives it back (store ids and plain values).
 * - **Concurrent run** with the same key: its claim waits on the unique index until the
 *   first transaction ends; if that one committed, it returns the stored result without
 *   running `work`; if it rolled back, it claims the key and runs `work` itself.
 * - **Work that throws:** the claim is removed and the error rethrown, so no key is left
 *   behind and a retry runs the work again. (A database error rolls back the whole
 *   transaction anyway.)
 *
 * A deterministic job id (`buildJobId`) only stops duplicate enqueues; this is what
 * makes the effect itself happen once. The work must be database work or an effect the
 * key protects; an external call still belongs after the commit (`.claude/rules/database.md`, rule 18).
 */
@Injectable()
export class IdempotencyRunner {
  constructor(private readonly db: DbContext) {}

  async runOnce<T extends Prisma.InputJsonValue>(
    operation: string,
    key: string,
    work: () => Promise<T>,
  ): Promise<T> {
    const scope = transactionScopeStorage.getStore();
    if (scope?.state !== 'open') {
      throw new IdempotencyOutsideTransactionError(operation);
    }
    const where = { operation_key: { operation, key } };
    // INSERT ... ON CONFLICT DO NOTHING: blocks while another transaction holds the same
    // key uncommitted, then inserts (it rolled back) or skips (it committed).
    const claimed = await this.db.client.idempotencyKey.createMany({
      data: { operation, key },
      skipDuplicates: true,
    });
    if (claimed.count === 0) {
      const existing = await this.db.client.idempotencyKey.findUnique({
        where,
        select: { outcome: true },
      });
      const outcome = existing?.outcome as StoredOutcome | null | undefined;
      if (outcome === null || outcome === undefined) {
        throw new MissingOutcomeError(operation);
      }
      return outcome.value as T;
    }

    let result: T;
    try {
      result = await work();
    } catch (error) {
      // Free the key for a retry, unless a failed query already doomed the transaction.
      if (scope.failure === undefined) {
        await this.db.client.idempotencyKey.delete({ where });
      }
      throw error;
    }
    const stored: Prisma.InputJsonObject = { value: result };
    await this.db.client.idempotencyKey.update({
      where,
      data: { outcome: stored },
    });
    return result;
  }
}
