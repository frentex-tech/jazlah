/** One page of a cursor-paged list, as the API answers it. */
export type CursorPage<T> = { items: T[]; nextCursor: string | null };

/**
 * The next page with at least one kept item: reads on while a page is emptied by `keep` and has a next cursor, up to
 * `max` pages (then answers the empty page with the cursor it stopped at, so «next» still works).
 */
export async function firstKeptPage<T>(
  get: (cursor: string | null | undefined) => Promise<CursorPage<T>>,
  cursor: string | null | undefined,
  keep: (x: T) => boolean,
  max = 5,
): Promise<CursorPage<T>> {
  let page = await get(cursor);
  for (let n = 1; n < max && page.nextCursor && !page.items.some(keep); n++) page = await get(page.nextCursor);
  return { items: page.items.filter(keep), nextCursor: page.nextCursor };
}
