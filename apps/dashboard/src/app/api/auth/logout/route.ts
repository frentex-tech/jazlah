import { NextResponse, type NextRequest } from 'next/server';
import { authBackend } from '@/lib/auth/backend';
import { clearAll } from '@/lib/auth/cookies';
import { clientIp, sameOrigin } from '@/lib/auth/request';
import { PANELS, refreshCookie } from '@/lib/session';

// Sign out of every panel: end each API session (always 204), then clear the cookies whatever happened.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const backend = authBackend();
  const ip = clientIp(req);
  await Promise.all(
    PANELS.map((p) => req.cookies.get(refreshCookie(p))?.value).filter((t): t is string => !!t).map((t) => backend.logout(t, ip)),
  );
  const locale = (await req.formData().catch(() => null))?.get('locale');
  const res = NextResponse.redirect(new URL(locale === 'en' ? '/en/login' : '/login', req.url), 303);
  clearAll(res);
  return res;
}
