import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminVendorsBackend } from '@/features/admin-vendors/backend';
import { CommissionSchema, ReasonSchema } from '@/features/admin-vendors/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Approve (with the commission in basis points) or reject (with a reason) a pending application (VND-DSH-2).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if ((action !== 'approve' && action !== 'reject') || !z.string().uuid().safeParse(id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  const body = await req.json().catch(() => null);
  return withPanelSession<unknown>(req, 'admin', async (token) => {
    const b = adminVendorsBackend();
    if (action === 'approve') {
      const p = CommissionSchema.safeParse(body);
      return p.success ? await b.approve(token, langOf(req), id, p.data.commissionBasisPoints) : invalidBody(p.error);
    }
    const p = ReasonSchema.safeParse(body);
    return p.success ? await b.reject(token, langOf(req), id, p.data.reason) : invalidBody(p.error);
  });
}
