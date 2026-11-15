/**
 * Answers whether a vendor is suspended. Declared here so the organisation status guard
 * and the auth module depend on an interface, not on the vendors module (R1); the
 * vendors module implements it and provides it under VENDOR_STATUS_CHECKER. Reads the
 * database on each call: a suspension takes effect at once.
 */
export interface VendorStatusChecker {
  /** True when the vendor is suspended, and when no vendor has this id. */
  isSuspended(vendorId: string): Promise<boolean>;
}
