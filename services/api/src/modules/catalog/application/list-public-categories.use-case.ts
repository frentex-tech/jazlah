import { Inject, Injectable } from '@nestjs/common';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ReferenceItem } from '../domain/reference-item.type';

/**
 * The public categories (FR-CAT-01): every active category, in the display order admins
 * set (lower first, then oldest first). Whole, not paged: a short list admins curate.
 */
@Injectable()
export class ListPublicCategoriesUseCase {
  constructor(
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  execute(): Promise<ReferenceItem[]> {
    return this.lists.listActiveCategories();
  }
}
