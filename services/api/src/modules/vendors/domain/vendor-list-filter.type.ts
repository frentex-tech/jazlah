import type { VendorStatus } from './vendor-status.type';

/** What the admin's list of vendors is narrowed to; every field given must match. */
export type VendorListFilter = Readonly<{
  status?: VendorStatus;
  /**
   * Contained, case-insensitively, in the Arabic or English store name, or in the
   * commercial registration number (Arabic digits read as Latin). Taken literally: `%`
   * and `_` are not wildcards.
   */
  q?: string;
  /** Exactly this city. */
  city?: string;
}>;
