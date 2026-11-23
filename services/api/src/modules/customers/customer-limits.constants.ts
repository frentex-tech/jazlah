/**
 * The limits of what a customer keeps with us. The name's length, the label's length
 * and the short national address's format are also check constraints
 * (`customer_profiles_full_name_check`, `customer_addresses_text_check`).
 */
export const CUSTOMER_LIMITS = {
  /** Characters of the full name; a profile is complete once it has one. */
  fullName: { min: 2, max: 60 },
  /** Characters of an email address (RFC 5321). */
  emailMax: 254,
  /** Saved addresses per customer. */
  addresses: 10,
  /** Characters of an address's label (Home, Work). */
  labelMax: 30,
  /** Characters of each readable address field: city, district, street, building. */
  addressFieldMax: 100,
  /** Characters of the instructions for the driver. */
  driverInstructionsMax: 300,
} as const;
