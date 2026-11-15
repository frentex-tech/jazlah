/** Injection token of the VendorAccess port. */
export const VENDOR_ACCESS = Symbol('VENDOR_ACCESS');

/** A user's vendor audience access (the users module keeps access). */
export interface VendorAccess {
  /**
   * Grants the vendor audience for one vendor. Database only, inside the caller's
   * transaction. Throws VENDOR_ACCESS_ALREADY_HELD when the user already works for
   * another vendor.
   */
  grant(userId: string, vendorId: string): Promise<void>;
  /** Whether the user already works for a vendor (an active vendor access). */
  isHeldBy(userId: string): Promise<boolean>;
}
