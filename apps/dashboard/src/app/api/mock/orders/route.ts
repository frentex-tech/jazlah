import { mocksEnabled } from '@/lib/mock';
import { NextResponse, type NextRequest } from 'next/server';
import { queryDemoOrders } from '@/features/table-demo/mock-orders';

// Mocked list endpoint for the DataTable demo. `?fail=1` answers 500 to show the error state.
export function GET(req: NextRequest) {
  if (!mocksEnabled()) return new NextResponse(null, { status: 404 });
  const p = req.nextUrl.searchParams;
  if (p.get('fail')) return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'demo failure' }, { status: 500 });
  const page = Math.max(1, Number(p.get('page')) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(p.get('pageSize')) || 5));
  return NextResponse.json(
    queryDemoOrders({ page, pageSize, status: p.get('status') ?? undefined, q: p.get('q') ?? undefined, sort: p.get('sort') ?? undefined }),
  );
}
