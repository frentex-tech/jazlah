import { isOrderedReferenceList } from '../is-ordered-reference-list';
import type { NewReferenceItem } from '../new-reference-item.type';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ReferenceListRepository } from '../ports/reference-list.repository.port';
import type { ReferenceItem } from '../reference-item.type';
import type { ReferenceItemChanges } from '../reference-item-changes.type';
import type { ReferenceList } from '../reference-list.type';
import { fakeIds } from './fake-ids.fake';

/** The admin lists in memory; `rows` is replaced on every write (fake rollback). */
export class InMemoryReferenceLists implements ReferenceListRepository {
  private readonly newId = fakeIds('8001');
  rows: readonly Readonly<{ list: ReferenceList; item: ReferenceItem }>[] = [];
  private clock = Date.UTC(2026, 10, 16, 9, 0, 0);

  /** Adds an entry directly (test setup), active unless said otherwise. */
  seed(list: ReferenceList, id: string, isActive = true): ReferenceItem {
    const item: ReferenceItem = {
      id,
      name: { ar: `${list} ${id.slice(-4)}`, en: `${list} ${id.slice(-4)}` },
      isActive,
      sortOrder: isOrderedReferenceList(list) ? 0 : null,
      createdAt: this.nextDate(),
    };
    this.rows = [...this.rows, { list, item }];
    return item;
  }

  /** The entry's name, as the product repository joins it. */
  find(list: ReferenceList, id: string): ReferenceItem | undefined {
    return this.rows.find((row) => row.list === list && row.item.id === id)
      ?.item;
  }

  create(list: ReferenceList, entry: NewReferenceItem): Promise<ReferenceItem> {
    const item: ReferenceItem = {
      id: this.newId(),
      name: entry.name,
      isActive: true,
      sortOrder: isOrderedReferenceList(list) ? (entry.sortOrder ?? 0) : null,
      createdAt: this.nextDate(),
    };
    this.rows = [...this.rows, { list, item }];
    return Promise.resolve(item);
  }

  update(
    list: ReferenceList,
    id: string,
    changes: ReferenceItemChanges,
  ): Promise<ReferenceItem | null> {
    const found = this.find(list, id);
    if (found === undefined) {
      return Promise.resolve(null);
    }
    const updated: ReferenceItem = { ...found, ...changes };
    this.rows = this.rows.map((row) =>
      row.list === list && row.item.id === id ? { list, item: updated } : row,
    );
    return Promise.resolve(updated);
  }

  list(
    list: ReferenceList,
    filter: Readonly<{ isActive?: boolean }>,
    page: PageRequest,
  ): Promise<Page<ReferenceItem>> {
    return Promise.resolve(
      keysetPage(
        this.rows
          .filter(
            (row) =>
              row.list === list &&
              (filter.isActive === undefined ||
                row.item.isActive === filter.isActive),
          )
          .map((row) => row.item),
        page,
      ),
    );
  }

  listActiveCategories(): Promise<ReferenceItem[]> {
    return Promise.resolve(
      this.rows
        .filter((row) => row.list === 'categories' && row.item.isActive)
        .map((row) => row.item)
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.createdAt.getTime() - b.createdAt.getTime() ||
            a.id.localeCompare(b.id),
        ),
    );
  }

  findActiveIds(
    list: ReferenceList,
    ids: readonly string[],
  ): Promise<ReadonlySet<string>> {
    return Promise.resolve(
      new Set(ids.filter((id) => this.find(list, id)?.isActive === true)),
    );
  }

  private nextDate(): Date {
    this.clock += 1_000;
    return new Date(this.clock);
  }
}
