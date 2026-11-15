import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ReferenceItem } from '../reference-item.type';
import type { ReferenceItemChanges } from '../reference-item-changes.type';
import type { ReferenceList } from '../reference-list.type';

/** Injection token of the ReferenceListRepository. */
export const REFERENCE_LIST_REPOSITORY = Symbol('REFERENCE_LIST_REPOSITORY');

/** Where the admin lists are kept, one table per list. */
export interface ReferenceListRepository {
  create(list: ReferenceList, name: LocalizedText): Promise<ReferenceItem>;

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

  /** Which of `ids` are active entries of the list. */
  findActiveIds(
    list: ReferenceList,
    ids: readonly string[],
  ): Promise<ReadonlySet<string>>;
}
