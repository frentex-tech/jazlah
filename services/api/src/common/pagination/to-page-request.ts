import { decodePageCursor } from './decode-page-cursor';
import type { PageRequest } from './page-request.type';
import { PAGE_SIZE } from './page-size.constants';

/**
 * The page a list query asks for (PageQueryDto, already validated: its cursor is one this
 * API wrote, its limit 1 to PAGE_SIZE.max).
 */
export function toPageRequest(
  query: Readonly<{ cursor?: string; limit?: number }>,
): PageRequest {
  return {
    cursor: query.cursor === undefined ? null : decodePageCursor(query.cursor),
    limit: query.limit ?? PAGE_SIZE.default,
  };
}
