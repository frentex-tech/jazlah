import { Inject, Injectable } from '@nestjs/common';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceItemView } from './reference-item-view.type';
import { toReferenceItemViews } from './to-reference-item-views';

/**
 * The public categories (FR-CAT-01): every active category, in the display order admins
 * set (lower first, then oldest first), each with its image URL. Whole, not paged: a
 * short list admins curate.
 */
@Injectable()
export class ListPublicCategoriesUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(): Promise<ReferenceItemView[]> {
    return toReferenceItemViews(
      await this.lists.listActiveCategories(),
      this.media,
    );
  }
}
