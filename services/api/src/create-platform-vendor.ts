import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationError } from '@config/env-validation.error';
import { loadEnv } from '@config/load-env';
import { CreatePlatformVendorUseCase } from '@modules/vendors';
import { CreatePlatformVendorModule } from './create-platform-vendor.module';

/**
 * `pnpm vendor:create-platform`: creates the platform's own vendor, which sells JAZLA's
 * products, unless it exists. Running it again changes nothing, and two runs at once
 * create one vendor. It starts no server and needs only the database. Exit code 0 on
 * success, 1 otherwise.
 */
async function main(): Promise<number> {
  await ConfigModule.envVariablesLoaded;
  loadEnv();
  const app = await NestFactory.createApplicationContext(
    CreatePlatformVendorModule,
    { logger: false, abortOnError: false },
  );
  try {
    const { vendor, created } = await app
      .get(CreatePlatformVendorUseCase)
      .execute();
    process.stdout.write(
      created
        ? `The platform vendor was created (vendor ${vendor.id}).\n`
        : `The platform vendor already exists (vendor ${vendor.id}); nothing changed.\n`,
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
    process.stderr.write(`${text}\n`);
    process.exit(1);
  },
);
