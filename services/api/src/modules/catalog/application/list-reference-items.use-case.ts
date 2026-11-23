import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceList } from '../domain/reference-list.type';
import type { ReferenceItemView } from './reference-item-view.type';
import { toReferenceItemViews } from './to-reference-item-views';

/**
 * The entries of one list for admins, newest first: all of them, or only active or
 * only inactive ones, each with its image URL (categories).
 */
@Injectable()
export class ListReferenceItemsUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(
    list: ReferenceList,
    filter: Readonly<{ isActive?: boolean }>,
    page: PageRequest,
  ): Promise<Page<ReferenceItemView>> {
    const found = await this.lists.list(list, filter, page);
    return {
      items: await toReferenceItemViews(found.items, this.media),
      nextCursor: found.nextCursor,
    };
  }
}
