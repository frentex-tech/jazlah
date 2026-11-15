import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import type { ReviewAccount } from './review-account.type';

/**
 * Reads AUTH_REVIEW_ACCOUNTS: comma-separated `phone:code` pairs, the phone a Saudi
 * mobile number in any form normalizeSaudiMobileNumber accepts, the code 4 to 8 Latin
 * digits. Returns null when an entry is malformed or a phone is listed twice; an empty
 * value is an empty list.
 */
export function parseReviewAccounts(value: string): ReviewAccount[] | null {
  const accounts: ReviewAccount[] = [];
  for (const entry of value.split(',')) {
    const trimmed = entry.trim();
    if (trimmed === '') {
      continue;
    }
    const separator = trimmed.lastIndexOf(':');
    if (separator === -1) {
      return null;
    }
    const phone = normalizeSaudiMobileNumber(trimmed.slice(0, separator));
    const code = trimmed.slice(separator + 1).trim();
    if (
      phone === null ||
      !/^\d{4,8}$/.test(code) ||
      accounts.some((account) => account.phone === phone)
    ) {
      return null;
    }
    accounts.push({ phone, code });
  }
  return accounts;
}
