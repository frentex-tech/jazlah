import { AsyncLocalStorage } from 'node:async_hooks';
import type { TransactionScope } from './transaction-scope.type';

/**
 * The transaction scope of the code running now, carried across awaits by Node's
 * AsyncLocalStorage. Set only by `runInTransaction`; read by `runAfterCommit`.
 */
export const transactionScopeStorage =
  new AsyncLocalStorage<TransactionScope>();
