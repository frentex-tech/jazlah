import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { CreateItemSchema, ListQuerySchema, ListSchema, queryOf } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// One catalog list (categories, meat types, cutting styles, "without" items): read it, or add an entry (CAT-DSH-1).
export async function GET(req: NextRequest, { params }: { params: Promise<{ list: string }> }) {
  const list = ListSchema.safeParse((await params).list);
  if (!list.success) return notFound();
  const query = ListQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    query.success ? await adminCatalogBackend().listItems(token, langOf(req), list.data, query.data) : invalidBody(query.error),
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ list: string }> }) {
  const list = ListSchema.safeParse((await params).list);
  if (!list.success) return notFound();
  const body = CreateItemSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().createItem(token, langOf(req), list.data, body.data) : invalidBody(body.error),
  );
}
