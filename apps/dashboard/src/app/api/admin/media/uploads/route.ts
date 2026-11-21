import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { UploadSchema } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Upload ticket for a product or category image (catalog.product-image, catalog.category-image); docs/frontend/uploads.md.
export async function POST(req: NextRequest) {
  const body = UploadSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().requestUpload(token, langOf(req), body.data) : invalidBody(body.error),
  );
}
