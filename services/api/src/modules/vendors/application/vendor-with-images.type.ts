import type { Vendor } from '../domain/vendor.entity';

/** A vendor and the public URLs of its logo and cover photo, as responses show it. */
export type VendorWithImages = Readonly<{
  vendor: Vendor;
  /** Null without a logo. */
  logoUrl: string | null;
  /** Null without a cover photo. */
  coverUrl: string | null;
}>;
