/**
 * Limits of the vendor's and the application's own fields that check constraints repeat
 * (migration `20261117140000_vendors_design_followups`).
 */
export const VENDOR_FIELD_LIMITS = {
  /** City name, code points (`vendors_city_check`, `vendor_applications_city_check`). */
  city: { min: 2, max: 50 },
  /** Contact email, as the customer profile's. */
  contactEmailMax: 254,
} as const;
