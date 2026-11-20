import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { CreateProductSchema, ProductQuerySchema, queryOf } from '@/features/catalog/schema';
import type { CreateProduct, ProductQuery } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Every vendor's products (filters status, vendorId), and a new JAZLA product as a draft (CAT-DSH-1).
export function GET(req: NextRequest) {
  const query = ProductQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    query.success ? await adminCatalogBackend().listProducts(token, langOf(req), query.data as ProductQuery) : invalidBody(query.error),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateProductSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().createProduct(token, langOf(req), body.data as CreateProduct) : invalidBody(body.error),
  );
}
