import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CatalogMedia } from '../domain/ports/catalog-media.port';

/** The upload purpose of every category image. */
const CATEGORY_IMAGE_PURPOSE = 'catalog.category-image';

/**
 * A category image being set (`imageMediaId` neither left out nor null) is a
 * `catalog.category-image` file the signed-in admin uploaded (MEDIA_NOT_FOUND otherwise:
 * another user's file is answered as missing) and confirmed (MEDIA_NOT_READY), as for
 * product images and vendor logos.
 */
export async function assertCategoryImage(
  imageMediaId: string | null | undefined,
  media: CatalogMedia,
  actorId: string,
): Promise<void> {
  if (imageMediaId === undefined || imageMediaId === null) {
    return;
  }
  const [file] = await media.findFiles([imageMediaId]);
  if (
    file === undefined ||
    file.ownerId !== actorId ||
    file.purpose !== CATEGORY_IMAGE_PURPOSE
  ) {
    throw new AppError(ErrorCode.MEDIA_NOT_FOUND, {
      details: { mediaId: imageMediaId },
    });
  }
  if (!file.isReady) {
    throw new AppError(ErrorCode.MEDIA_NOT_READY, {
      details: { mediaId: imageMediaId },
    });
  }
}
