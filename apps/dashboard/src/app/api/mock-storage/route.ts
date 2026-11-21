import { NextResponse, type NextRequest } from 'next/server';
import { mockBackends } from '@/lib/mock-backends';

// Stands in for the storage of presigned uploads on the mocks only (DASHBOARD_API_MOCK=1): the browser POSTs the ticket
// fields and the file here, as it would to the bucket, and public files (logo, cover) are served back;
// documents only on a signed admin link. 404 otherwise.
export async function POST(req: NextRequest) {
  const mockStorage = mockBackends()?.storage;
  if (!mockStorage) return new NextResponse(null, { status: 404 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const key = form?.get('key');
  if (!(file instanceof Blob) || typeof key !== 'string' || file.size === 0) return new NextResponse(null, { status: 400 });
  return new NextResponse(null, { status: mockStorage.put(key, await file.arrayBuffer()) ? 204 : 403 });
}

export function GET(req: NextRequest) {
  // A document link of the admin review mock carries its expiry, as a presigned URL would. Like the real storage, it
  // checks no session: the link itself is the permission (mock only, signature not checked).
  const signed = Number(req.nextUrl.searchParams.get('expires')) > Date.now();
  const m = mockBackends()?.storage.get(req.nextUrl.searchParams.get('key') ?? '', signed);
  return m?.bytes ? new NextResponse(m.bytes, { headers: { 'Content-Type': m.contentType } }) : new NextResponse(null, { status: 404 });
}
