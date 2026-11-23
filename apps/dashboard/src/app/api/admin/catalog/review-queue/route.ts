import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { ReviewQuerySchema, queryOf } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// The review queue: new products and pending edits in one list, newest first, and `count` for the side nav badge
// (GET /v1/admin/review-queue, filters kind and vendorId).
export function GET(req: NextRequest) {
  const query = ReviewQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    query.success ? await adminCatalogBackend().reviewQueue(token, langOf(req), query.data) : invalidBody(query.error),
  );
}
