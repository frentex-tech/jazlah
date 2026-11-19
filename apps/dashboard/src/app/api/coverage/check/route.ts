import { NextResponse, type NextRequest } from 'next/server';
import { coverageBackend } from '@/features/coverage/backend';

// Passes through the public GET /v1/public/coverage/check?lat=&lng= (no session needed).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const latS = sp.get('lat')?.trim();
  const lngS = sp.get('lng')?.trim();
  const lat = Number(latS);
  const lng = Number(lngS);
  if (!latS || !lngS || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ code: 'VALIDATION_FAILED' }, { status: 400 });
  }
  const r = await coverageBackend().check(lat, lng, req.headers.get('accept-language') === 'en' ? 'en' : 'ar');
  return r.ok ? NextResponse.json(r.data) : NextResponse.json({ code: r.code }, { status: r.status });
}
