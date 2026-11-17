import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationError } from '@config/env-validation.error';
import { loadEnv } from '@config/load-env';
import { vendorsConfig } from '@config/vendors.config';
import type { VendorsConfig } from '@config/vendors-config.type';
import { DbContext } from '@infra/database/db-context';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { StorageService } from '@integrations/storage';
import { UsersService } from '@modules/users';
import { CreatePlatformVendorUseCase } from '@modules/vendors';
import { countSeededTables } from './count-seeded-tables';
import { formatReviewAccountsLine } from './format-review-accounts-line';
import { listDevelopmentSignIns } from './list-development-sign-ins';
import { productionRefusal } from './production-refusal';
import { seedDevelopmentData } from './seed-development-data';
import { SeedModule } from './seed.module';
import { SeedTally } from './seed-tally';

/**
 * `pnpm db:seed`: fills a local development database (and the local storage) with
 * realistic data, so the frontends show every screen and every state: the admin lists,
 * the platform vendor and partner vendors (one suspended), products in every review
 * state, vendor applications in every status with their documents, customers with
 * profiles, addresses and consent, and one development account per audience.
 *
 * Refuses NODE_ENV=production before touching anything (exit code 1). Idempotent: it
 * creates only what is missing, never updates or deletes a row, and writes the same
 * objects to the same keys, so a second run changes nothing. It never resets the
 * database. Needs the database (migrated) and the storage (`pnpm infra:up`); no API
 * server. At the end it prints what it did, the row count of each table it writes,
 * and the AUTH_REVIEW_ACCOUNTS line that lets the development accounts sign in with a
 * fixed code. Exit code 0 on success, 1 otherwise.
 */
async function main(): Promise<number> {
  await ConfigModule.envVariablesLoaded;
  const env = loadEnv();
  const refusal = productionRefusal(env.NODE_ENV);
  if (refusal !== null) {
    process.stderr.write(`${refusal}\n`);
    return 1;
  }
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: false,
    abortOnError: false,
  });
  try {
    const tally = new SeedTally();
    const ibanConfig = app.get<VendorsConfig>(vendorsConfig.KEY);
    const db = app.get(DbContext);
    await seedDevelopmentData(
      {
        db,
        transactions: app.get(TransactionRunner),
        storage: app.get(StorageService),
        users: app.get(UsersService),
        ibanKey: ibanConfig.ibanKey,
        tally,
      },
      app.get(CreatePlatformVendorUseCase),
    );
    const counts = await countSeededTables(db);
    const signIns = listDevelopmentSignIns(env.AUTH_OTP_LENGTH);
    process.stdout.write(
      [
        'JAZLA development seed: done.',
        '',
        'This run:',
        ...tally.lines(),
        '',
        'Rows in each table now:',
        ...counts.map(([table, count]) => `  ${table}: ${count}`),
        '',
        'Development accounts (sign in with the fixed code; no SMS is sent):',
        ...signIns.map(
          (signIn) =>
            `  ${signIn.audience.padEnd(8)} ${signIn.phone}  code ${signIn.code}  ${signIn.purpose}`,
        ),
        '',
        'Add this line to services/api/.env (local only), then restart the API:',
        formatReviewAccountsLine(signIns),
        '',
      ].join('\n'),
    );
    return 0;
  } finally {
    await app.close();
  }
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
