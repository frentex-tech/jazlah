import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';

/** What UpdateOwnVendorProfileUseCase needs; both ids come from the access token. */
export type UpdateOwnVendorProfileInput = Readonly<{
  /** The token's organisation. */
  vendorId: string;
  /** The signed-in user: a new logo must be a file they uploaded. */
  userId: string;
  changes: VendorProfileChanges;
}>;
