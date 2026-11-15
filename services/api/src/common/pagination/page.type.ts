import type { PageCursor } from './page-cursor.type';

/** One page of a list, and where the next starts (null: this is the last page). */
export type Page<T> = Readonly<{
  items: readonly T[];
  nextCursor: PageCursor | null;
}>;
