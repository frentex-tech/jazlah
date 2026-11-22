import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { queryOf } from '@/features/admin-vendors/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';
import { accessCookie } from '@/lib/session';
import { ordersBackend, type OrdersPanel } from './backend';
import { OrderQuerySchema, TransitionSchema } from './schema';

// The order routes shared by /api/admin/orders and /api/vendor/orders (ORD-DSH-1): same calls, the panel's session.
export type IdCtx = { params: Promise<{ id: string }> };
export const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
export const isId = (id: string) => z.string().uuid().safeParse(id).success;

export function listOrders(req: NextRequest, panel: OrdersPanel) {
  const parsed = OrderQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, panel, async (token) => (parsed.success ? ordersBackend().list(token, langOf(req), panel, parsed.data) : invalidBody(parsed.error)));
}

export async function getOrder(req: NextRequest, panel: OrdersPanel, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  return withPanelSession(req, panel, (token) => ordersBackend().get(token, langOf(req), panel, id));
}

export async function transitionOrder(req: NextRequest, panel: OrdersPanel, { params }: IdCtx) {
  const { id } = await params;
  if (!isId(id)) return notFound();
  const parsed = TransitionSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, panel, async (token) => (parsed.success ? ordersBackend().transition(token, langOf(req), panel, id, parsed.data) : invalidBody(parsed.error)));
}

/**
 * Server-sent `order.created` events for the board, while the backend can push (the mock; ORD-API-3's socket.io once
 * wired). 404 otherwise: the page then polls. Reads only the access cookie: a missing or ended session gets 401 and the
 * page keeps its list (the next list call refreshes the session).
 */
export function orderEvents(req: NextRequest, panel: OrdersPanel) {
  const backend = ordersBackend();
  if (!backend.watch) return notFound();
  const token = req.cookies.get(accessCookie(panel))?.value;
  if (!token) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const enc = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(ctl) {
      const send = (s: string) => {
        try {
          ctl.enqueue(enc.encode(s));
        } catch {
          stop();
        }
      };
      send(': connected\n\n');
      const off = backend.watch!(token, panel, (o) => send(`event: order.created\ndata: ${JSON.stringify(o)}\n\n`));
      const ping = setInterval(() => send(': ping\n\n'), 25_000);
      stop = () => {
        off();
        clearInterval(ping);
      };
      req.signal.addEventListener('abort', () => {
        stop();
        try {
          ctl.close();
        } catch {}
      });
    },
    cancel: () => stop(),
  });
  return new NextResponse(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
