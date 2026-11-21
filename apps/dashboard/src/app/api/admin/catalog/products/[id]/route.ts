import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { ContentSchema, IdSchema } from '@/features/catalog/schema';
import type { ProductContent } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  return withPanelSession(req, 'admin', (token) => adminCatalogBackend().product(token, langOf(req), id));
}

// Replaces a JAZLA product's whole content (PUT /v1/admin/products/{id}).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  const body = ContentSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().updateProduct(token, langOf(req), id, body.data as ProductContent) : invalidBody(body.error),
  );
}
