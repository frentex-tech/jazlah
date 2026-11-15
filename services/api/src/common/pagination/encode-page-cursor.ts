import type { PageCursor } from './page-cursor.type';

/**
 * The opaque text a client sends back as `cursor` for the next page: base64url of the
 * creation time and the id. Clients must not read or build it.
 */
export function encodePageCursor(cursor: PageCursor): string {
  return Buffer.from(
    JSON.stringify([cursor.createdAt.toISOString(), cursor.id]),
  ).toString('base64url');
}
