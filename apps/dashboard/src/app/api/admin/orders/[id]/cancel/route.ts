import type { NextRequest } from 'next/server';
import { ordersBackend } from '@/features/orders/backend';
import { isId, notFound, type IdCtx } from '@/features/orders/routes';
import { CancelSchema } from '@/features/orders/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Cancel & refund (135:49317): admins only.
export async function POST(req: NextRequest, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  const parsed = CancelSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? ordersBackend().cancel(token, langOf(req), id, parsed.data) : invalidBody(parsed.error)));
}
