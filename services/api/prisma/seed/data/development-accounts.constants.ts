import type { DevelopmentAccount } from './development-account.type';

/**
 * The accounts frontend developers sign in with, one per audience plus a customer
 * whose profile is incomplete. Each signs in through AUTH_REVIEW_ACCOUNTS (a fixed
 * code, no SMS): the seed prints the line to add to `.env`.
 */
export const DEVELOPMENT_ACCOUNTS: readonly DevelopmentAccount[] = [
  {
    user: 'dev-customer',
    audience: 'customer',
    codeDigit: '1',
    purpose: 'complete profile, three addresses, marketing consent',
  },
  {
    user: 'dev-vendor',
    audience: 'vendor',
    codeDigit: '2',
    purpose:
      'Al Nokhba Butchery: products in every state, a pending change request',
  },
  {
    user: 'dev-kitchen',
    audience: 'kitchen',
    codeDigit: '3',
    purpose: 'kitchen staff of the platform vendor (JAZLA)',
  },
  {
    user: 'dev-admin',
    audience: 'admin',
    codeDigit: '4',
    purpose: 'reviews applications, products and change requests',
  },
  {
    user: 'dev-customer-new',
    audience: 'customer',
    codeDigit: '5',
    purpose: 'no name yet: the skippable profile completion screen',
  },
];
