import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { mockBackends } from '@/lib/mock-backends';
import { METHODS } from '@/features/orders/types';

// Places an order in the orders mock, as checkout would, for the Playwright «new order appears live» test. Mocks only
// (test builds with DASHBOARD_API_MOCK=1): 404 otherwise, and a production build has no mock code at all.
const Body = z.object({ vendor: z.string().max(100).optional(), customer: z.string().max(100).optional(), method: z.enum(METHODS).optional() });

export async function POST(req: NextRequest) {
  const mocks = mockBackends();
  if (!mocks) return new NextResponse(null, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  return NextResponse.json(mocks.placeOrder(parsed.data), { status: 201 });
}
