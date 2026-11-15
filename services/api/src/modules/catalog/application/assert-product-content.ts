import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import type { CatalogMedia } from '../domain/ports/catalog-media.port';
import type { ReferenceListRepository } from '../domain/ports/reference-list.repository.port';
import type { ProductContent } from '../domain/product-content.type';

/** The upload purpose of every product image. */
const IMAGE_PURPOSE = 'catalog.product-image';

/**
 * Checks what a product's content refers to, before it is stored:
 *
 * - the category, meat type, cutting styles and "without" items are active entries of
 *   their lists, or VALIDATION_FAILED on each field that is not;
 * - each image not already on the product (`keptImageIds`) is a `catalog.product-image`
 *   file the signed-in user uploaded (MEDIA_NOT_FOUND otherwise: another user's file is
 *   answered as missing) and confirmed (MEDIA_NOT_READY).
 */
export async function assertProductContent(
  content: ProductContent,
  lists: ReferenceListRepository,
  media: CatalogMedia,
  actorId: string,
  keptImageIds: readonly string[],
): Promise<void> {
  const [categories, meatTypes, cuttingStyles, exclusionItems] =
    await Promise.all([
      lists.findActiveIds('categories', [content.categoryId]),
      lists.findActiveIds(
        'meat_types',
        content.meatTypeId === null ? [] : [content.meatTypeId],
      ),
      lists.findActiveIds(
        'cutting_styles',
        content.cuttings.map((cutting) => cutting.cuttingStyleId),
      ),
      lists.findActiveIds('exclusion_items', content.exclusionItemIds),
    ]);
  const details: FieldError[] = [
    ...(categories.has(content.categoryId)
      ? []
      : [{ field: 'categoryId', constraints: ['isActiveCategory'] }]),
    ...(content.meatTypeId === null || meatTypes.has(content.meatTypeId)
      ? []
      : [{ field: 'meatTypeId', constraints: ['isActiveMeatType'] }]),
    ...content.cuttings.flatMap((cutting, index) =>
      cuttingStyles.has(cutting.cuttingStyleId)
        ? []
        : [
            {
              field: `cuttings.${index}.cuttingStyleId`,
              constraints: ['isActiveCuttingStyle'],
            },
          ],
    ),
    ...content.exclusionItemIds.flatMap((id, index) =>
      exclusionItems.has(id)
        ? []
        : [
            {
              field: `exclusionItemIds.${index}`,
              constraints: ['isActiveExclusionItem'],
            },
          ],
    ),
  ];
  if (details.length > 0) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
  }

  const newImages = content.imageMediaIds.filter(
    (id) => !keptImageIds.includes(id),
  );
  const files = new Map(
    (await media.findFiles(newImages)).map((file) => [file.id, file]),
  );
  for (const mediaId of newImages) {
    const file = files.get(mediaId);
    if (
      file === undefined ||
      file.ownerId !== actorId ||
      file.purpose !== IMAGE_PURPOSE
    ) {
      throw new AppError(ErrorCode.MEDIA_NOT_FOUND, { details: { mediaId } });
    }
    if (!file.isReady) {
      throw new AppError(ErrorCode.MEDIA_NOT_READY, { details: { mediaId } });
    }
  }
}
