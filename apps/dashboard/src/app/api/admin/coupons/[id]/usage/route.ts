import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { couponsBackend } from '@/features/coupons/backend';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

// A coupon's usage: uses, distinct customers, total discount in halalas (CRT-DSH-1).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  return withPanelSession(req, 'admin', (token) => couponsBackend().usage(token, langOf(req), id));
}
