import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { IdSchema, ListSchema, UpdateItemSchema } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Rename an entry, switch it on or off, or (categories) reorder it or change its image (CAT-DSH-1).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ list: string; id: string }> }) {
  const p = await params;
  const list = ListSchema.safeParse(p.list);
  if (!list.success || !IdSchema.safeParse(p.id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  const body = UpdateItemSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().updateItem(token, langOf(req), list.data, p.id, body.data) : invalidBody(body.error),
  );
}
