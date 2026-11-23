import { NextResponse, type NextRequest } from 'next/server';
import { vendorCatalogBackend } from '@/features/catalog/vendor-backend';
import { ContentSchema, IdSchema } from '@/features/catalog/schema';
import type { ProductContent } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  return withPanelSession(req, 'vendor', (token) => vendorCatalogBackend().product(token, langOf(req), id));
}

// The whole content (PUT /v1/vendor/products/{id}): saved on a draft or rejected product, a change request on a published one.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  const body = ContentSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'vendor', async (token) =>
    body.success ? await vendorCatalogBackend().updateProduct(token, langOf(req), id, body.data as ProductContent) : invalidBody(body.error),
  );
}
