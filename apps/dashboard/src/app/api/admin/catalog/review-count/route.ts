import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import type { ApiResult } from '@/lib/auth/panel-session';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

/** Items of every page of a cursor-paged list, or the first refusal. */
async function countAll(get: (cursor?: string) => Promise<ApiResult<{ items: unknown[]; nextCursor: string | null }>>): Promise<ApiResult<number>> {
  let n = 0;
  let cursor: string | undefined;
  do {
    const r = await get(cursor);
    if (!r.ok) return r;
    n += r.data.items.length;
    cursor = r.data.nextCursor ?? undefined;
  } while (cursor);
  return { ok: true, data: n };
}

// The side nav badge: new products under review plus pending edits. shortcut: API gap, no count endpoint; counts every page.
export function GET(req: NextRequest) {
  const lang = langOf(req);
  return withPanelSession(req, 'admin', async (token) => {
    const b = adminCatalogBackend();
    const [products, edits] = await Promise.all([
      countAll((cursor) => b.listProducts(token, lang, { status: 'pending_review', cursor, limit: 50 })),
      countAll((cursor) => b.listChangeRequests(token, lang, { cursor, limit: 50 })),
    ]);
    if (!products.ok) return products;
    if (!edits.ok) return edits;
    return { ok: true, data: { count: products.data + edits.data } };
  });
}
