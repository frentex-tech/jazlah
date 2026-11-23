import type { VendorWithImages } from '../application/vendor-with-images.type';
import { maskIban } from '../domain/mask-iban';
import type { VendorProfileResponseDto } from './dto/vendor-profile-response.dto';
import { toPublicVendorResponse } from './to-public-vendor-response';

/** A vendor's own profile; the IBAN only masked. */
export function toVendorProfileResponse(
  found: VendorWithImages,
): VendorProfileResponseDto {
  const { vendor } = found;
  return {
    ...toPublicVendorResponse(found),
    commissionBasisPoints: vendor.commissionBasisPoints,
    commercialRegistrationNumber: vendor.commercialRegistrationNumber,
    vatNumber: vendor.vatNumber,
    contactPhone: vendor.contactPhone,
    contactEmail: vendor.contactEmail,
    ibanMasked: vendor.ibanLast4 === null ? null : maskIban(vendor.ibanLast4),
    accountHolderName: vendor.accountHolderName,
    location: vendor.location === null ? null : { ...vendor.location },
    createdAt: vendor.createdAt,
  };
}
