import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationError } from '@config/env-validation.error';
import { loadEnv } from '@config/load-env';
import { runSeed } from './run-seed';
import { SeedModule } from './seed.module';

/**
 * `pnpm db:seed`: fills a local development database (and the local storage) with
 * realistic data, so the frontends show every screen and every state: the admin lists,
 * the platform vendor and partner vendors (one suspended), products in every review
 * state, vendor applications in every status with their documents, customers with
 * profiles, addresses and consent, and one development account per audience.
 *
 * Refuses NODE_ENV=production before touching anything (exit code 1; runSeed, proven
 * by run-seed.spec.ts). Idempotent: it creates only what is missing and writes the same
 * objects to the same keys, so a second run changes nothing. It deletes nothing, and
 * updates one thing only: re-granting the development admin re-activates that admin
 * access when it was deactivated (UsersService.grantAdminAccess). It never resets the
 * database. Needs the database (migrated) and the storage (`pnpm infra:up`); no API
 * server. At the end it prints what it did, the row count of each table it writes,
 * and the AUTH_REVIEW_ACCOUNTS line that lets the development accounts sign in with a
 * fixed code. Exit code 0 on success, 1 otherwise.
 */
async function main(): Promise<number> {
  return runSeed({
    loadEnv: async () => {
      await ConfigModule.envVariablesLoaded;
      return loadEnv();
    },
    createApp: () =>
      NestFactory.createApplicationContext(SeedModule, {
        logger: false,
        abortOnError: false,
      }),
    write: (text) => {
      process.stdout.write(text);
    },
    writeError: (text) => {
      process.stderr.write(text);
    },
  });
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    const text =
      error instanceof EnvValidationError
        ? error.message
        : error instanceof Error
          ? (error.stack ?? error.message)
          : String(error);
    process.stderr.write(
      `${text}\npnpm db:seed failed. It needs the migrated database and the storage: pnpm infra:up, then pnpm db:deploy. Running it again after a fix is safe.\n`,
    );
    process.exit(1);
  },
);
