/**
 * Why a customer deletes their account, from a fixed list the app shows (never free
 * text, which could hold personal data). Stored in the deletion's audit entry only.
 */
export const ACCOUNT_DELETION_REASONS = [
  'not_using',
  'privacy',
  'bad_experience',
  'other_account',
  'other',
] as const;
