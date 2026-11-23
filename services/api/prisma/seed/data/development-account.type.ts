/**
 * A development sign-in: a seeded user, the audience a frontend signs them in for, and
 * the digit their fixed review code repeats (AUTH_REVIEW_ACCOUNTS, AUTH_OTP_LENGTH
 * digits long). Staff access comes from the data: the vendor account owns a partner
 * vendor, the kitchen account works for the platform vendor, the admin account is an
 * admin.
 */
export type DevelopmentAccount = Readonly<{
  /** A SeedUser key. */
  user: string;
  audience: 'customer' | 'vendor' | 'kitchen' | 'admin';
  codeDigit: string;
  /** What the account shows a frontend developer. */
  purpose: string;
}>;
