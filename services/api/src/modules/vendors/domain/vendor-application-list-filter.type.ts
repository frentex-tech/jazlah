import type { VendorApplicationStatus } from './vendor-application-status.type';

/** What the admin's list of applications is narrowed to; every field given must match. */
export type VendorApplicationListFilter = Readonly<{
  status?: VendorApplicationStatus;
  /**
   * Contained, case-insensitively, in the Arabic or English store name, or in the
   * commercial registration number (Arabic digits read as Latin). Taken literally: `%`
   * and `_` are not wildcards.
   */
  q?: string;
}>;
