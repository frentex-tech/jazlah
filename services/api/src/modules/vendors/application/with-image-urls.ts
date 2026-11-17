import type { Vendor } from '../domain/vendor.entity';
import type { VendorMedia } from '../domain/ports/vendor-media.port';
import type { VendorWithImages } from './vendor-with-images.type';

/** Each vendor with the public URLs of its logo and cover photo, in one read for all. */
export async function withImageUrls(
  media: Pick<VendorMedia, 'publicUrls'>,
  vendors: readonly Vendor[],
): Promise<VendorWithImages[]> {
  const urls = await media.publicUrls(
    vendors.flatMap((vendor) =>
      [vendor.logoMediaId, vendor.coverMediaId].filter(
        (id): id is string => id !== null,
      ),
    ),
  );
  const urlOf = (id: string | null): string | null =>
    id === null ? null : (urls.get(id) ?? null);
  return vendors.map((vendor) => ({
    vendor,
    logoUrl: urlOf(vendor.logoMediaId),
    coverUrl: urlOf(vendor.coverMediaId),
  }));
}
