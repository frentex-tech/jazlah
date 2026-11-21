import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { IdSchema, ReasonSchema } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Approve or reject (with a reason) a vendor's edit of a published product.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!IdSchema.safeParse(id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  const b = adminCatalogBackend();
  if (action === 'approve') return withPanelSession(req, 'admin', (token) => b.approveChange(token, langOf(req), id));
  if (action !== 'reject') return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  const body = ReasonSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (body.success ? await b.rejectChange(token, langOf(req), id, body.data.reason) : invalidBody(body.error)));
}
