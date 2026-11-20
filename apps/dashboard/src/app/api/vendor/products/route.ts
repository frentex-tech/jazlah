import type { NextRequest } from 'next/server';
import { vendorCatalogBackend } from '@/features/catalog/vendor-backend';
import { CreateProductSchema, ProductQuerySchema, queryOf } from '@/features/catalog/schema';
import type { CreateProduct, ProductQuery } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// The vendor's own products (filter status), and a new one as a draft (CAT-DSH-2).
export function GET(req: NextRequest) {
  const query = ProductQuerySchema.omit({ vendorId: true }).safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'vendor', async (token) =>
    query.success ? await vendorCatalogBackend().listProducts(token, langOf(req), query.data as ProductQuery) : invalidBody(query.error),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateProductSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'vendor', async (token) =>
    body.success ? await vendorCatalogBackend().createProduct(token, langOf(req), body.data as CreateProduct) : invalidBody(body.error),
  );
}
