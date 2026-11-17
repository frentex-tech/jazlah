import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import { ReferenceListEntry } from '../domain/reference-list-entry.entity';
import type { ReferenceItemChanges } from '../domain/reference-item-changes.type';
import type { ReferenceList } from '../domain/reference-list.type';
import { assertCategoryImage } from './assert-category-image';
import type { ReferenceItemView } from './reference-item-view.type';
import { toReferenceItemViews } from './to-reference-item-views';

/**
 * An admin renames an entry, switches it on or off, or reorders a category or sets or
 * clears its image (a ready `catalog.category-image` file the admin uploaded; null
 * clears it). An inactive entry can no longer be chosen for a product; an inactive
 * category hides its products from the public at once. A display order or an image on
 * another list is refused (ReferenceListEntry.assertOrderable, assertImageable);
 * NOT_FOUND for an unknown id.
 */
@Injectable()
export class UpdateReferenceItemUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(
    list: ReferenceList,
    id: string,
    changes: ReferenceItemChanges,
    actorId: string,
  ): Promise<ReferenceItemView> {
    ReferenceListEntry.assertOrderable(list, changes.sortOrder);
    ReferenceListEntry.assertImageable(list, changes.imageMediaId);
    await assertCategoryImage(changes.imageMediaId, this.media, actorId);
    const item = await this.lists.update(list, id, changes);
    if (item === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const [view] = await toReferenceItemViews([item], this.media);
    return view;
  }
}
