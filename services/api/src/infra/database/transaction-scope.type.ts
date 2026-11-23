import type { AfterCommitCallback } from './after-commit-callback.type';
import type { Prisma } from './generated/prisma/client';
import type { TransactionState } from './transaction-state.type';

/**
 * What the outermost `runInTransaction` keeps while its transaction is open, in
 * `transactionScopeStorage`:
 *
 * - `client`: the transaction client. `DbContext.client` returns it, so every query
 *   made inside the scope joins the transaction.
 * - `afterCommit`: callbacks to run once it commits (`runAfterCommit`), dropped on rollback.
 * - `failure`: the first query error inside the scope (`trackQueryFailures`). Once set,
 *   the transaction may not commit: PostgreSQL has already discarded its work.
 * - `state`: `open`, then `committed` or `rolled-back`, set by `runInTransaction`. The
 *   scope outlives the transaction in any async work started inside it.
 */
export type TransactionScope = {
  readonly client: Prisma.TransactionClient;
  readonly afterCommit: AfterCommitCallback[];
  failure: { readonly error: unknown } | undefined;
  state: TransactionState;
};
