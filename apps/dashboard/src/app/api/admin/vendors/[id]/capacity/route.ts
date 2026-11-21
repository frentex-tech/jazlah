import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { operationsBackend } from '@/features/operations/backend';
import { VendorDefaultSchema } from '@/features/operations/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

type Ctx = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// A vendor's capacity (SCH-DSH-1): its default override and specific dates.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return notFound();
  return withPanelSession(req, 'admin', (token) => operationsBackend().vendorCapacity(token, langOf(req), id));
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return notFound();
  const parsed = VendorDefaultSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? operationsBackend().setVendorDefault(token, langOf(req), id, parsed.data) : invalidBody(parsed.error)));
}
