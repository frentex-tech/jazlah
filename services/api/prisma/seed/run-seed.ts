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
import type { SeedRunDependencies } from './seed-run-dependencies.type';
import { SeedTally } from './seed-tally';

/**
 * One run of `pnpm db:seed` (seed.ts), given what it reads and starts, so its test can
 * prove the order: the environment first, then the production refusal, and only then
 * `createApp`, the one step that connects to the database, Redis or the storage.
 * When DEPLOYMENT_ENV is production, or staging without `--allow-staging`, it writes
 * the refusal and returns 1 without calling `createApp`. Otherwise it seeds, prints the summary and returns 0, or rejects.
 */
export async function runSeed(
  dependencies: SeedRunDependencies,
): Promise<number> {
  const env = await dependencies.loadEnv();
  const refusal = productionRefusal(
    env.DEPLOYMENT_ENV,
    dependencies.allowStaging,
  );
  if (refusal !== null) {
    dependencies.writeError(`${refusal}\n`);
    return 1;
  }
  const app = await dependencies.createApp();
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
    dependencies.write(
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
