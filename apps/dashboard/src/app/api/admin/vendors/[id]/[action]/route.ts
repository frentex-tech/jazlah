import { NextResponse, type NextRequest } from 'next/server';
import { adminVendorsBackend, allowed } from '@/features/admin-vendors/backend';
import { ReasonSchema } from '@/features/admin-vendors/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Suspend (with a reason) or reinstate a vendor (VND-DSH-2).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (action !== 'suspend' && action !== 'reinstate') return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  const body = action === 'suspend' ? ReasonSchema.safeParse(await req.json().catch(() => null)) : null;
  return withPanelSession<unknown>(req, 'admin', async (token) => {
    const b = adminVendorsBackend();
    if (!body) return allowed(await b.reinstate(token, langOf(req), id));
    return body.success ? allowed(await b.suspend(token, langOf(req), id, body.data.reason)) : invalidBody(body.error);
  });
}
