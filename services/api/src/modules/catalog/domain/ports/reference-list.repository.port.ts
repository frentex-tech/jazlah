import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewReferenceItem } from '../new-reference-item.type';
import type { ReferenceItem } from '../reference-item.type';
import type { ReferenceItemChanges } from '../reference-item-changes.type';
import type { ReferenceList } from '../reference-list.type';

/** Injection token of the ReferenceListRepository. */
export const REFERENCE_LIST_REPOSITORY = Symbol('REFERENCE_LIST_REPOSITORY');

/** Where the admin lists are kept, one table per list. */
export interface ReferenceListRepository {
  /** Adds an active entry; a category's `sortOrder` defaults to 0. */
  create(list: ReferenceList, item: NewReferenceItem): Promise<ReferenceItem>;

  /** Applies the changes; null when the list has no entry with this id. */
  update(
    list: ReferenceList,
    id: string,
    changes: ReferenceItemChanges,
  ): Promise<ReferenceItem | null>;

  /** Newest first, optionally only active or only inactive entries. */
  list(
    list: ReferenceList,
    filter: Readonly<{ isActive?: boolean }>,
    page: PageRequest,
  ): Promise<Page<ReferenceItem>>;

  /**
   * Every active category in display order (`sortOrder`, then oldest first): the public
   * list, whole. A short list admins curate, so not paged.
   */
  listActiveCategories(): Promise<ReferenceItem[]>;

  /** Which of `ids` are active entries of the list. */
  findActiveIds(
    list: ReferenceList,
    ids: readonly string[],
  ): Promise<ReadonlySet<string>>;
}
