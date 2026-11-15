import type { PageCursor } from './page-cursor.type';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const CURSOR_TEXT = /^[A-Za-z0-9_-]{1,200}$/;

/** Parses JSON, or returns undefined for text that is not JSON. */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON: not a cursor this API wrote. The caller answers null for it.
    return undefined;
  }
}

/** The cursor encodePageCursor wrote, or null for anything else (tampered or foreign text). */
export function decodePageCursor(text: string): PageCursor | null {
  if (!CURSOR_TEXT.test(text)) {
    return null;
  }
  const parsed = parseJson(Buffer.from(text, 'base64url').toString('utf8'));
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 2 ||
    typeof parsed[0] !== 'string' ||
    typeof parsed[1] !== 'string' ||
    !ISO_TIME.test(parsed[0]) ||
    !UUID.test(parsed[1])
  ) {
    return null;
  }
  const createdAt = new Date(parsed[0]);
  return Number.isNaN(createdAt.getTime()) ||
    createdAt.toISOString() !== parsed[0]
    ? null
    : { createdAt, id: parsed[1].toLowerCase() };
}
