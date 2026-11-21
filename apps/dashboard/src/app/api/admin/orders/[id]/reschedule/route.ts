import type { NextRequest } from 'next/server';
import { ordersBackend } from '@/features/orders/backend';
import { isId, notFound, type IdCtx } from '@/features/orders/routes';
import { RescheduleSchema } from '@/features/orders/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Reschedule (135:49465): the days on offer, then the new date. Admins only.
export async function GET(req: NextRequest, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  return withPanelSession(req, 'admin', (token) => ordersBackend().rescheduleDays(token, langOf(req), id));
}

export async function POST(req: NextRequest, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  const parsed = RescheduleSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? ordersBackend().reschedule(token, langOf(req), id, parsed.data.date) : invalidBody(parsed.error)));
}
