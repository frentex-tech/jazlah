import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { maskPhoneNumber } from '@common/phone/mask-phone-number';
import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import { EnvValidationError } from '@config/env-validation.error';
import { loadEnv } from '@config/load-env';
import { UsersService } from '@modules/users';
import { CreateAdminModule } from './create-admin.module';

/**
 * `pnpm admin:create <phone>`: grants admin access to a phone number, creating the user
 * if there is none. This is how the first admin comes to exist; an admin then signs in
 * like anyone else, with a code sent to that phone.
 *
 * The number is validated as a Saudi mobile number in any usual form. Running it again
 * for the same phone changes nothing (it reactivates an access that was deactivated).
 * It starts no server and needs only the database. Exit code 0 on success, 1 otherwise.
 * The output names the phone masked, never in full.
 */
async function main(argument: string | undefined): Promise<number> {
  const phone =
    argument === undefined ? null : normalizeSaudiMobileNumber(argument);
  if (phone === null) {
    process.stderr.write(
      'usage: pnpm admin:create <phone>\nThe phone must be a Saudi mobile number, for example 0512345678 or +966512345678.\n',
    );
    return 1;
  }
  await ConfigModule.envVariablesLoaded;
  loadEnv();
  const app = await NestFactory.createApplicationContext(CreateAdminModule, {
    logger: false,
    abortOnError: false,
  });
  try {
    const user = await app.get(UsersService).grantAdminAccess(phone);
    process.stdout.write(
      `Admin access is active for ${maskPhoneNumber(phone)} (user ${user.id}).\n`,
    );
    return 0;
  } finally {
    await app.close();
  }
}

main(process.argv[2]).then(
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
