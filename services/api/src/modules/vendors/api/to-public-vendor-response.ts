import type { VendorWithImages } from '../application/vendor-with-images.type';
import type { PublicVendorResponseDto } from './dto/public-vendor-response.dto';

/** A vendor as anyone sees it; the contact details and VAT number stay out. */
export function toPublicVendorResponse({
  vendor,
  logoUrl,
  coverUrl,
}: VendorWithImages): PublicVendorResponseDto {
  return {
    id: vendor.id,
    name: { ...vendor.name },
    description: { ...vendor.description },
    logoUrl,
    coverUrl,
    city: vendor.city,
  };
}
