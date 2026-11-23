import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { couponsBackend } from '@/features/coupons/backend';
import { CouponPatchSchema } from '@/features/coupons/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// One coupon: read it, or change the keys sent (the form sends all of them, deactivate `isActive` alone) (CRT-DSH-1).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return notFound();
  return withPanelSession(req, 'admin', (token) => couponsBackend().get(token, langOf(req), id));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return notFound();
  const parsed = CouponPatchSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? await couponsBackend().update(token, langOf(req), id, parsed.data) : invalidBody(parsed.error)));
}
