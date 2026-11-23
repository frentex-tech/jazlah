import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { mockBackends } from '@/lib/mock-backends';
import { isSameOriginJson } from '@/lib/auth/request';
import { PANELS_COOKIE, parseSessions, refreshCookie } from '@/lib/session';
import { METHODS } from '@/features/orders/types';

// Places an order in the orders mock, as checkout would, for the Playwright «new order appears live» test. Mocks only
// (test builds with DASHBOARD_API_MOCK=1): 404 otherwise, and a production build has no mock code at all. Like every
// mutating panel route, it wants our own pages (same-origin JSON) and a live admin or vendor session.
const Body = z.object({ vendor: z.string().max(100).optional(), customer: z.string().max(100).optional(), method: z.enum(METHODS).optional() });

export async function POST(req: NextRequest) {
  const mocks = mockBackends();
  if (!mocks) return new NextResponse(null, { status: 404 });
  if (!isSameOriginJson(req)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const panels = parseSessions(req.cookies.get(PANELS_COOKIE)?.value);
  if (!(['admin', 'vendor'] as const).some((p) => panels.includes(p) && req.cookies.has(refreshCookie(p)))) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  return NextResponse.json(mocks.placeOrder(parsed.data), { status: 201 });
}
