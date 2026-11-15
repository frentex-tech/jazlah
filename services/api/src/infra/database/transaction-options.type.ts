import type { Prisma } from './generated/prisma/client';

/**
 * Per-call overrides for `runInTransaction`. Unset values come from the `database`
 * config (DATABASE_TRANSACTION_TIMEOUT_MS, DATABASE_TRANSACTION_MAX_WAIT_MS,
 * DATABASE_ISOLATION_LEVEL). A call that joins an open transaction ignores them.
 */
export type TransactionOptions = Readonly<{
  /** How long the transaction may run before Prisma rolls it back (ms). */
  timeout?: number;
  /** How long to wait for a pooled connection before giving up (ms). */
  maxWait?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}>;
