import { encodePageCursor } from './encode-page-cursor';
import type { Page } from './page.type';

/** The `nextCursor` a list response sends: the opaque cursor, or null on the last page. */
export function toNextCursor(page: Page<unknown>): string | null {
  return page.nextCursor === null ? null : encodePageCursor(page.nextCursor);
}
