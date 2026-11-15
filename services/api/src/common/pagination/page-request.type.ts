import type { PageCursor } from './page-cursor.type';

/** Which page to read: after `cursor` (null: the first page), at most `limit` items. */
export type PageRequest = Readonly<{
  cursor: PageCursor | null;
  limit: number;
}>;
