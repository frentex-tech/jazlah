import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminVendorsBackend, allowed, loadReview } from '@/features/admin-vendors/backend';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

// The review screen (VND-DSH-2): a vendor with its application, or a pending application, from either id.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Not an id at all: answered as the API answers an unknown one.
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  return withPanelSession(req, 'admin', async (token) => allowed(await loadReview(adminVendorsBackend(), token, langOf(req), id)));
}
