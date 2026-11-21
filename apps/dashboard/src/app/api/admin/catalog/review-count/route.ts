import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

const CAP = 50;

// The side nav badge: new products under review plus pending edits, counted up to 50 («50+» beyond).
// shortcut: API gap, no review-queue count (B6, CAT-DSH-2 #52 stays open until it is wired): reads the first page (50) of each
// list, never more; switch to the count endpoint when it exists.
export function GET(req: NextRequest) {
  const lang = langOf(req);
  return withPanelSession(req, 'admin', async (token) => {
    const b = adminCatalogBackend();
    const [products, edits] = await Promise.all([
      b.listProducts(token, lang, { status: 'pending_review', limit: CAP }),
      b.listChangeRequests(token, lang, { limit: CAP }),
    ]);
    if (!products.ok) return products;
    if (!edits.ok) return edits;
    const n = products.data.items.length + edits.data.items.length;
    const more = n > CAP || !!products.data.nextCursor || !!edits.data.nextCursor;
    return { ok: true, data: { count: Math.min(n, CAP), more } };
  });
}
