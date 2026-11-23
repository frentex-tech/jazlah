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
  const { rescheduleDays } = ordersBackend();
  if (!rescheduleDays) return notFound(); // no reschedule on the Sprint 3 API
  return withPanelSession(req, 'admin', (token) => rescheduleDays(token, langOf(req), id));
}

export async function POST(req: NextRequest, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  const { reschedule } = ordersBackend();
  if (!reschedule) return notFound(); // Sprint 4 route, not on the Sprint 3 API
  const parsed = RescheduleSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? reschedule(token, langOf(req), id, parsed.data.date) : invalidBody(parsed.error)));
}
