import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { PageQuerySchema, queryOf } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Pending edits of published products, newest first (GET /v1/admin/product-change-requests).
export function GET(req: NextRequest) {
  const query = PageQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    query.success ? await adminCatalogBackend().listChangeRequests(token, langOf(req), query.data) : invalidBody(query.error),
  );
}
