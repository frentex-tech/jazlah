import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import { DEVELOPMENT_ACCOUNTS } from './data/development-accounts.constants';
import { SEED_USERS } from './data/users.constants';
import type { DevelopmentSignIn } from './development-sign-in.type';

/**
 * The development accounts with their phones (E.164) and fixed codes: each code repeats
 * the account's digit `otpLength` times, so it has exactly the AUTH_OTP_LENGTH digits a
 * review code must have.
 */
export function listDevelopmentSignIns(otpLength: number): DevelopmentSignIn[] {
  return DEVELOPMENT_ACCOUNTS.map((account) => {
    const user = SEED_USERS.find((candidate) => candidate.key === account.user);
    const phone =
      user === undefined ? null : normalizeSaudiMobileNumber(user.phone);
    if (phone === null) {
      throw new Error(
        `Development account ${account.user} has no seeded Saudi mobile number`,
      );
    }
    return {
      phone,
      code: account.codeDigit.repeat(otpLength),
      audience: account.audience,
      purpose: account.purpose,
    };
  });
}
