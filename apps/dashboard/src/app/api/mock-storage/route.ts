import { NextResponse, type NextRequest } from 'next/server';
import { mockStorage } from '@/features/vendor-onboarding/backend';
import { mocksEnabled } from '@/lib/mock';

// Stands in for the storage of presigned uploads on the mocks only (DASHBOARD_API_MOCK=1): the browser POSTs the ticket
// fields and the file here, as it would to the bucket, and public files (logo, cover) are served back. 404 otherwise.
export async function POST(req: NextRequest) {
  if (!mocksEnabled()) return new NextResponse(null, { status: 404 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const key = form?.get('key');
  if (!(file instanceof Blob) || typeof key !== 'string' || file.size === 0) return new NextResponse(null, { status: 400 });
  return new NextResponse(null, { status: mockStorage.put(key, await file.arrayBuffer()) ? 204 : 403 });
}

export function GET(req: NextRequest) {
  const m = mocksEnabled() ? mockStorage.get(req.nextUrl.searchParams.get('key') ?? '') : null;
  return m?.bytes ? new NextResponse(m.bytes, { headers: { 'Content-Type': m.contentType } }) : new NextResponse(null, { status: 404 });
}
