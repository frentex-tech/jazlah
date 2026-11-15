import { decodePageCursor } from './decode-page-cursor';
import { encodePageCursor } from './encode-page-cursor';
import { toNextCursor } from './to-next-cursor';
import { toPage } from './to-page';
import { toPageRequest } from './to-page-request';

const ID = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';
const AT = new Date('2026-11-15T10:00:00.000Z');
const encoded = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

describe('page cursors', () => {
  it('round-trips a cursor', () => {
    expect(
      decodePageCursor(encodePageCursor({ createdAt: AT, id: ID })),
    ).toEqual({ createdAt: AT, id: ID });
  });

  it.each([
    ['empty', ''],
    ['not base64url', 'a+b/c='],
    ['not JSON', Buffer.from('nope').toString('base64url')],
    ['an object', encoded({ a: 1 })],
    ['a bad id', encoded([AT.toISOString(), 'x'])],
    ['an impossible time', encoded(['2026-02-30T10:00:00.000Z', ID])],
    ['a time without milliseconds', encoded(['2026-11-15T10:00:00Z', ID])],
  ])('refuses %s', (_label, text) => {
    expect(decodePageCursor(text)).toBeNull();
  });
});

describe('toPage and toNextCursor', () => {
  const rows = [3, 2, 1].map((n) => ({
    id: `${ID.slice(0, -1)}${n}`,
    createdAt: new Date(AT.getTime() + n),
  }));

  it('returns the cursor of the last item when a further row exists', () => {
    const page = toPage(rows, 2);

    expect(page).toEqual({
      items: rows.slice(0, 2),
      nextCursor: { createdAt: rows[1]?.createdAt, id: rows[1]?.id },
    });
    expect(decodePageCursor(toNextCursor(page) ?? '')).toEqual(page.nextCursor);
  });

  it('returns no cursor on the last page', () => {
    expect(toPage(rows, 3)).toEqual({ items: rows, nextCursor: null });
    expect(toPage([], 3)).toEqual({ items: [], nextCursor: null });
    expect(toNextCursor(toPage(rows, 3))).toBeNull();
  });
});

describe('toPageRequest', () => {
  it('defaults to the first page of 20', () => {
    expect(toPageRequest({})).toEqual({ cursor: null, limit: 20 });
  });
});
