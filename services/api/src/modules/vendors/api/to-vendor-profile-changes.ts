import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';
import type { UpdateVendorProfileAsAdminDto } from './dto/update-vendor-profile-as-admin.dto';
import type { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';

/**
 * The body of a profile update as the changes it asks for; what it leaves out is
 * unchanged. A vendor's body has no city; an admin's may.
 */
export function toVendorProfileChanges(
  body: UpdateVendorProfileDto | UpdateVendorProfileAsAdminDto,
): VendorProfileChanges {
  const city = 'city' in body ? body.city : undefined;
  return {
    ...(body.logoMediaId === undefined
      ? {}
      : { logoMediaId: body.logoMediaId }),
    ...(body.coverMediaId === undefined
      ? {}
      : { coverMediaId: body.coverMediaId }),
    ...(body.description?.ar === undefined
      ? {}
      : { descriptionAr: body.description.ar }),
    ...(body.description?.en === undefined
      ? {}
      : { descriptionEn: body.description.en }),
    ...(body.contactPhone === undefined
      ? {}
      : { contactPhone: body.contactPhone }),
    ...(body.contactEmail === undefined
      ? {}
      : { contactEmail: body.contactEmail }),
    ...(body.vatNumber === undefined ? {} : { vatNumber: body.vatNumber }),
    ...(city === undefined ? {} : { city }),
  };
}
