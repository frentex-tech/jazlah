import type { PrismaClient } from './generated/prisma/client';
import { transactionScopeStorage } from './transaction-scope.storage';

/**
 * Returns `client` extended so that every failed query (model operations and raw SQL)
 * made inside a `runInTransaction` scope marks the scope as failed before the error is
 * thrown on. `runInTransaction` then refuses to commit, even if the work caught the error.
 *
 * Why: after any error, PostgreSQL rejects the rest of the transaction and turns its
 * COMMIT into a ROLLBACK without reporting an error. Without this, work that catches a
 * database error and returns would be reported as committed while nothing was saved.
 *
 * A query extension changes no model types, but Prisma types an extended client apart
 * from PrismaClient (their delegates are not mutually assignable). So the result is
 * checked with `isTrackedClient`, not asserted (R21), and typed as the client it extends.
 */
export function trackQueryFailures(client: PrismaClient): PrismaClient {
  const tracked: unknown = client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          // Prisma types the result of a query of any model and operation as `any`.
          const result: unknown = await query(args);
          return result;
        } catch (error) {
          const scope = transactionScopeStorage.getStore();
          if (scope !== undefined && scope.failure === undefined) {
            scope.failure = { error };
          }
          throw error;
        }
      },
    },
  });
  if (!isTrackedClient(tracked, client)) {
    throw new TypeError(
      'Prisma returned an extended client without $transaction',
    );
  }
  return tracked;
}

/**
 * True when `value` is a client extension of `client`: an object with the
 * `$transaction` method runInTransaction calls. Prisma's extended client is a proxy of
 * the root client with the same delegates.
 */
function isTrackedClient(
  value: unknown,
  client: PrismaClient,
): value is PrismaClient {
  return (
    typeof value === 'object' &&
    value !== null &&
    value !== client &&
    typeof Reflect.get(value, '$transaction') === 'function'
  );
}
