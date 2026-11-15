import { registerAs } from '@nestjs/config';
import { loadEnv } from './load-env';

/**
 * The `database` namespace. Inject with `@Inject(databaseConfig.KEY) config: DatabaseConfig`.
 * `url` holds the password: never log it or put it in an error.
 *
 * The pool and the transaction defaults apply to every transaction unless
 * `runInTransaction` is given its own (`.claude/rules/database.md`, "Transactions").
 */
export const databaseConfig = registerAs('database', () => {
  const env = loadEnv();
  return {
    url: env.DATABASE_URL,
    poolSize: env.DATABASE_POOL_SIZE,
    connectionTimeoutMs: env.DATABASE_CONNECTION_TIMEOUT_MS,
    transactionTimeoutMs: env.DATABASE_TRANSACTION_TIMEOUT_MS,
    transactionMaxWaitMs: env.DATABASE_TRANSACTION_MAX_WAIT_MS,
    isolationLevel: env.DATABASE_ISOLATION_LEVEL,
  };
});
