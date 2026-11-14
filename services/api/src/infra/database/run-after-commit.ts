import { Logger } from '@nestjs/common';
import type { AfterCommitCallback } from './after-commit-callback.type';
import { runIsolatedCallback } from './run-isolated-callback';
import { transactionScopeStorage } from './transaction-scope.storage';

const logger = new Logger('runAfterCommit');

/**
 * Runs `callback` once the current transaction has committed, by the state of the
 * transaction scope of this async context:
 *
 * - **No transaction:** now.
 * - **Open** (inside `runInTransaction`, at any depth, across awaits): after the
 *   outermost commit, in registration order; dropped if it rolls back or the attempt is
 *   retried.
 * - **Already committed** (registered from async work that outlived the transaction):
 *   now.
 * - **Already rolled back:** dropped, and logged at warn: the effect it stood for has
 *   no committed data behind it.
 *
 * For effects that must not be seen before the data is committed: the event bus
 * publishes through it. Every callback runs isolated (`runIsolatedCallback`), here and
 * after a commit: one that throws or rejects is logged at error and affects neither the
 * caller nor the committed transaction nor the other callbacks.
 */
export function runAfterCommit(callback: AfterCommitCallback): void {
  const scope = transactionScopeStorage.getStore();
  switch (scope?.state) {
    case undefined:
    case 'committed':
      runIsolatedCallback(callback, logger);
      return;
    case 'rolled-back':
      logger.warn(
        'An after-commit callback was registered after its transaction rolled back; it is dropped',
      );
      return;
    case 'open':
      scope.afterCommit.push(callback);
  }
}
