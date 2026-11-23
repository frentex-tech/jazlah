import type { Page } from './page.type';

/**
 * A page from rows read with `limit + 1`, newest first: the extra row, if any, only says
 * that another page exists, and the cursor is the last row returned.
 */
export function toPage<T extends Readonly<{ createdAt: Date; id: string }>>(
  rows: readonly T[],
  limit: number,
): Page<T> {
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor:
      rows.length > limit && last !== undefined
        ? { createdAt: last.createdAt, id: last.id }
        : null,
  };
}
