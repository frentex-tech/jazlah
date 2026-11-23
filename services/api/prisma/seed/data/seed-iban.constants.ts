/**
 * The IBAN every seeded application and vendor carries: a published example of a valid
 * Saudi IBAN (as in the e2e tests), not anyone's account. Stored encrypted under the
 * configured VENDORS_IBAN_KEY, as the API stores one.
 */
export const SEED_IBAN = {
  electronic: 'SA0380000000608010167519',
  last4: '7519',
} as const;
