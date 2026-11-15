import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { VendorMedia } from '../domain/ports/vendor-media.port';

/** The upload purpose of a vendor logo. */
const LOGO_PURPOSE = 'vendor.logo';

/**
 * Checks that `logoId` can become a vendor's logo: a `vendor.logo` file uploaded by
 * `userId` (the signed-in user, vendor or admin) and confirmed. Another user's file, a
 * file of another purpose or one that does not exist is MEDIA_NOT_FOUND, alike; one not
 * confirmed is MEDIA_NOT_READY.
 */
export async function assertUsableLogo(
  media: VendorMedia,
  logoId: string,
  userId: string,
): Promise<void> {
  const [file] = await media.findFiles([logoId]);
  if (
    file === undefined ||
    file.ownerId !== userId ||
    file.purpose !== LOGO_PURPOSE
  ) {
    throw new AppError(ErrorCode.MEDIA_NOT_FOUND, {
      details: { mediaId: logoId },
    });
  }
  if (!file.isReady) {
    throw new AppError(ErrorCode.MEDIA_NOT_READY, {
      details: { mediaId: logoId },
    });
  }
}
