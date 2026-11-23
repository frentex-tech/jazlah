import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';

/** What UpdateVendorProfileAsAdminUseCase needs. */
export type UpdateVendorProfileAsAdminInput = Readonly<{
  /** Any vendor, the platform vendor included, named in the request. */
  vendorId: string;
  /** The signed-in admin: a new logo or cover must be a file they uploaded. */
  actorId: string;
  changes: VendorProfileChanges;
}>;
