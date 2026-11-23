import { Inject, Injectable } from '@nestjs/common';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { NewReferenceItem } from '../domain/new-reference-item.type';
import { ReferenceListEntry } from '../domain/reference-list-entry.entity';
import type { ReferenceList } from '../domain/reference-list.type';
import { assertCategoryImage } from './assert-category-image';
import type { ReferenceItemView } from './reference-item-view.type';
import { toReferenceItemViews } from './to-reference-item-views';

/**
 * An admin adds an entry to one of the lists (FR-ADM-02); it starts active. A category
 * may take its display order (0 when left out) and an image (a ready
 * `catalog.category-image` file the admin uploaded); another list refuses both
 * (ReferenceListEntry.assertOrderable, assertImageable).
 */
@Injectable()
export class CreateReferenceItemUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(
    list: ReferenceList,
    item: NewReferenceItem,
    actorId: string,
  ): Promise<ReferenceItemView> {
    ReferenceListEntry.assertOrderable(list, item.sortOrder);
    ReferenceListEntry.assertImageable(list, item.imageMediaId);
    await assertCategoryImage(item.imageMediaId, this.media, actorId);
    const [view] = await toReferenceItemViews(
      [await this.lists.create(list, item)],
      this.media,
    );
    return view;
  }
}
