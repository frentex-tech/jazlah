/** Injection token of the VendorAccess port. */
export const VENDOR_ACCESS = Symbol('VENDOR_ACCESS');

/** Grants a user the vendor audience for one vendor (the users module keeps access). */
export interface VendorAccess {
  /**
   * Database only, inside the caller's transaction. Throws CONFLICT when the user
   * already works for another vendor.
   */
  grant(userId: string, vendorId: string): Promise<void>;
}
