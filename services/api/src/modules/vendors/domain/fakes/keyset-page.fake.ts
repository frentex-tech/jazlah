import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';

/** The in-memory fakes' keyset pagination: newest first, then id, strictly after the cursor. */
export function keysetPage<T extends Readonly<{ createdAt: Date; id: string }>>(
  rows: readonly T[],
  page: PageRequest,
): Page<T> {
  const sorted = [...rows].sort(
    (a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime() ||
      (a.id < b.id ? 1 : a.id > b.id ? -1 : 0),
  );
  const { cursor } = page;
  const after =
    cursor === null
      ? sorted
      : sorted.filter(
          (row) =>
            row.createdAt < cursor.createdAt ||
            (row.createdAt.getTime() === cursor.createdAt.getTime() &&
              row.id < cursor.id),
        );
  return toPage(after.slice(0, page.limit + 1), page.limit);
}
