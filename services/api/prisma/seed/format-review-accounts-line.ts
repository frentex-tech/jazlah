import type { DevelopmentSignIn } from './development-sign-in.type';

/**
 * The `.env` line that lets the development accounts sign in with their fixed codes
 * (AUTH_REVIEW_ACCOUNTS: `phone:code` pairs, comma-separated). The seed cannot change
 * `.env`; it prints this for the developer to add.
 */
export function formatReviewAccountsLine(
  signIns: readonly DevelopmentSignIn[],
): string {
  return `AUTH_REVIEW_ACCOUNTS=${signIns
    .map((signIn) => `${signIn.phone}:${signIn.code}`)
    .join(',')}`;
}
