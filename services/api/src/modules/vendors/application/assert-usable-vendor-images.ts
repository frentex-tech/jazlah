import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { VendorMedia } from '../domain/ports/vendor-media.port';
import type { VendorProfileChanges } from '../domain/vendor-profile-changes.type';

/**
 * Checks the images a profile change sets: a new `logoMediaId` must be a `vendor.logo`
 * file, a new `coverMediaId` a `vendor.cover` file, each uploaded by `userId` (the
 * signed-in user, vendor or admin) and confirmed. Another user's file, a file of another
 * purpose or one that does not exist is MEDIA_NOT_FOUND, alike; one not confirmed is
 * MEDIA_NOT_READY; both with `details.mediaId`. The logo is checked first. Null (removal)
 * and a field left out are not checked.
 */
export async function assertUsableVendorImages(
  media: VendorMedia,
  changes: VendorProfileChanges,
  userId: string,
): Promise<void> {
  const wanted = [
    { id: changes.logoMediaId, purpose: 'vendor.logo' },
    { id: changes.coverMediaId, purpose: 'vendor.cover' },
  ].flatMap(({ id, purpose }) =>
    id === undefined || id === null ? [] : [{ id, purpose }],
  );
  if (wanted.length === 0) {
    return;
  }
  const files = await media.findFiles(wanted.map(({ id }) => id));
  for (const { id, purpose } of wanted) {
    const file = files.find((found) => found.id === id);
    if (
      file === undefined ||
      file.ownerId !== userId ||
      file.purpose !== purpose
    ) {
      throw new AppError(ErrorCode.MEDIA_NOT_FOUND, {
        details: { mediaId: id },
      });
    }
    if (!file.isReady) {
      throw new AppError(ErrorCode.MEDIA_NOT_READY, {
        details: { mediaId: id },
      });
    }
  }
}
