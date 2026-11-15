import { normalizeSaudiMobileNumber } from './normalize-saudi-mobile-number';

/** How many final digits stay visible. */
const VISIBLE_DIGITS = 2;

/**
 * A phone number fit for a log: the masking helper for phone numbers
 * (`.claude/rules/invariants.md`, "Secrets and personal data"). A Saudi mobile number,
 * in any form normalizeSaudiMobileNumber accepts, becomes `+966*******78`: the country
 * code and the last two digits. Anything else becomes one `*` per digit but the last
 * two (separators and other characters dropped), or only `*` with fewer than four
 * digits, so a malformed value is never logged whole.
 */
export function maskPhoneNumber(phone: string): string {
  const saudi = normalizeSaudiMobileNumber(phone);
  if (saudi !== null) {
    return `+966${'*'.repeat(7)}${saudi.slice(-VISIBLE_DIGITS)}`;
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return '*'.repeat(digits.length);
  }
  return `${'*'.repeat(digits.length - VISIBLE_DIGITS)}${digits.slice(-VISIBLE_DIGITS)}`;
}
