import type { NextRequest } from 'next/server';
import { queryOf } from '@/features/admin-vendors/schema';
import { couponsBackend } from '@/features/coupons/backend';
import { CouponQuerySchema, CouponSchema } from '@/features/coupons/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// The admin coupons list (status, code search, cursor) and a new coupon (CRT-DSH-1).
export function GET(req: NextRequest) {
  const parsed = CouponQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? await couponsBackend().list(token, langOf(req), parsed.data) : invalidBody(parsed.error)));
}

export async function POST(req: NextRequest) {
  const parsed = CouponSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? await couponsBackend().create(token, langOf(req), parsed.data) : invalidBody(parsed.error)));
}
