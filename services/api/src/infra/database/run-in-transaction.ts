import { Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  TRANSACTION_MAX_ATTEMPTS,
  TRANSACTION_RETRY_BASE_DELAY_MS,
} from './database.constants';
import { isWriteConflict } from './is-write-conflict';
import { mapPrismaError } from './map-prisma-error';
import type { PrismaService } from './prisma.service';
import { runIsolatedCallback } from './run-isolated-callback';
import { TransactionAbortedError } from './transaction-aborted.error';
import type { TransactionOptions } from './transaction-options.type';
import { transactionScopeStorage } from './transaction-scope.storage';
import type { TransactionScope } from './transaction-scope.type';

const logger = new Logger('runInTransaction');

/**
 * Runs `work` in one database transaction. Modules call it through
 * `TransactionRunner.run`; queries inside `work` get the transaction client from
 * `DbContext.client`, at any depth, so no client is passed down by hand.
 *
 * - **Joins.** Called while a transaction is open in this async context, it runs `work`
 *   in that transaction, whatever client it is given; `options` are then ignored.
 * - **Commits or rolls back as one.** When `work` throws, everything is rolled back and
 *   the error is rethrown (a Prisma error mapped by `mapPrismaError`).
 * - **A database error ends it.** If any query inside failed (`trackQueryFailures`) and
 *   `work` returned anyway, nothing is committed: it rejects with
 *   TransactionAbortedError, an internal error.
 * - **Retries write conflicts.** A serialization failure or deadlock (P2034) reruns the
 *   whole transaction, up to TRANSACTION_MAX_ATTEMPTS times with jittered delays, then
 *   rejects with TRANSACTION_CONFLICT (409). So `work` is database work only: no HTTP
 *   call, queue add or message inside it (`.claude/rules/database.md`).
 * - **After-commit callbacks** (`runAfterCommit`, the event bus) run after the
 *   outermost commit, in order, each isolated (`runIsolatedCallback`); they are dropped
 *   on rollback and with a retried attempt. The scope's `state` records the outcome, for
 *   callbacks registered later from async work started inside the transaction.
 */
export async function runInTransaction<T>(
  prisma: PrismaService,
  work: () => Promise<T>,
  options: TransactionOptions = {},
): Promise<T> {
  if (transactionScopeStorage.getStore() !== undefined) {
    return work();
  }
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await attemptTransaction(prisma, work, options);
    } catch (error) {
      if (!isWriteConflict(error)) {
        mapPrismaError(error);
      }
      if (attempt >= TRANSACTION_MAX_ATTEMPTS) {
        throw new AppError(ErrorCode.TRANSACTION_CONFLICT, { cause: error });
      }
      logger.warn(
        { err: error, attempt, maxAttempts: TRANSACTION_MAX_ATTEMPTS },
        'Transaction hit a write conflict; running it again',
      );
      await sleep(
        Math.random() * TRANSACTION_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
      );
    }
  }
}

async function attemptTransaction<T>(
  prisma: PrismaService,
  work: () => Promise<T>,
  options: TransactionOptions,
): Promise<T> {
  let scope: TransactionScope | undefined;
  let result: T;
  try {
    result = await prisma.trackedClient.$transaction(async (tx) => {
      const current: TransactionScope = {
        client: tx,
        afterCommit: [],
        failure: undefined,
        state: 'open',
      };
      scope = current;
      const value = await transactionScopeStorage.run(current, work);
      if (current.failure !== undefined) {
        // Throwing here makes Prisma roll back instead of sending COMMIT.
        throw new TransactionAbortedError(current.failure.error);
      }
      return value;
    }, options);
  } catch (error) {
    if (scope !== undefined) {
      scope.state = 'rolled-back';
    }
    throw error;
  }
  if (scope === undefined) {
    return result;
  }
  scope.state = 'committed';
  const callbacks = scope.afterCommit.splice(0);
  // Committed. Run the callbacks outside the scope, so they are not deferred again; the
  // data is committed, so a failing callback must not turn that into a failure.
  transactionScopeStorage.exit(() => {
    for (const callback of callbacks) {
      runIsolatedCallback(callback, logger);
    }
  });
  return result;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
