import type { PageCursor } from '@common/pagination/page-cursor.type';

/**
 * The `where` condition of keyset pagination, for a list ordered newest first by
 * `createdAt` then `id` (KEYSET_ORDER): the rows strictly after `cursor`, or every row
 * for the first page. Spread it into a Prisma `where` beside the list's own filters,
 * order by KEYSET_ORDER, and read `limit + 1` rows (toPage). Needs an index on the
 * filter columns followed by (created_at, id).
 */
export function keysetAfter(cursor: PageCursor | null): {
  OR?: (
    { createdAt: { lt: Date } } | { createdAt: Date; id: { lt: string } }
  )[];
} {
  return cursor === null
    ? {}
    : {
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      };
}
