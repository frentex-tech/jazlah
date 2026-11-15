import type { Vendor } from '../domain/vendor.entity';

/** A vendor and the public URL of its logo, as responses show it. */
export type VendorWithLogo = Readonly<{
  vendor: Vendor;
  /** Null without a logo. */
  logoUrl: string | null;
}>;
