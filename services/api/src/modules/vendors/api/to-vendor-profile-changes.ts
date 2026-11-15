import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';
import type { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';

/** The body of a profile update as the changes it asks for; what it leaves out is unchanged. */
export function toVendorProfileChanges(
  body: UpdateVendorProfileDto,
): VendorProfileChanges {
  return {
    ...(body.logoMediaId === undefined
      ? {}
      : { logoMediaId: body.logoMediaId }),
    ...(body.description?.ar === undefined
      ? {}
      : { descriptionAr: body.description.ar }),
    ...(body.description?.en === undefined
      ? {}
      : { descriptionEn: body.description.en }),
  };
}
