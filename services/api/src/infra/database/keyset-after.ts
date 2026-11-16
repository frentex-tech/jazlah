import type { PageCursor } from '@common/pagination/page-cursor.type';

/**
 * The `where` condition of keyset pagination, for a list ordered newest first by
 * `createdAt` then `id` (KEYSET_ORDER): the rows strictly after `cursor`, or every row
 * for the first page. Spread it into a Prisma `where` beside the list's own filters
 * (none of them on `createdAt`), order by KEYSET_ORDER, and read `limit + 1` rows
 * (toPage). Needs an index on the filter columns followed by (created_at, id).
 *
 * `createdAt <= cursor` repeats what the `OR` implies: PostgreSQL uses it as an index
 * bound, so a page deep in a list starts at the cursor instead of reading and discarding
 * every newer row (measured on 50,000 products, 10,000 rows deep: 101 ms without it,
 * 0.25 ms with it).
 */
export function keysetAfter(cursor: PageCursor | null): {
  createdAt?: { lte: Date };
  OR?: (
    { createdAt: { lt: Date } } | { createdAt: Date; id: { lt: string } }
  )[];
} {
  return cursor === null
    ? {}
    : {
        createdAt: { lte: cursor.createdAt },
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      };
}
