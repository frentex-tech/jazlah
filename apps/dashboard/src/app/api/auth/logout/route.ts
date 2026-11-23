import { NextResponse, type NextRequest } from 'next/server';
import { authBackend } from '@/lib/auth/backend';
import { clearAll, clearPanel, writePanels } from '@/lib/auth/cookies';
import { clientIp, sameOrigin } from '@/lib/auth/request';
import { PANELS_COOKIE, SESSIONS, parseSessions, refreshCookie, type Session } from '@/lib/session';

// Sign out of every session: end each API session (always 204), then clear the cookies whatever happened.
// `only=customer` (the vendor application's sign-out) ends the customer session alone and goes back to the application.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const customerOnly = form?.get('only') === 'customer';
  const ended: readonly Session[] = customerOnly ? ['customer'] : SESSIONS;
  const backend = authBackend();
  const ip = clientIp(req);
  await Promise.all(
    ended.map((p) => req.cookies.get(refreshCookie(p))?.value).filter((t): t is string => !!t).map((t) => backend.logout(t, ip)),
  );
  const prefix = form?.get('locale') === 'en' ? '/en' : '';
  // A relative Location: behind the host's proxy req.url is the internal address (https://localhost:10000), which
  // the browser refuses to follow from a form post (CSP form-action 'self'), #22.
  const res = new NextResponse(null, { status: 303, headers: { Location: `${prefix}${customerOnly ? '/vendor/apply' : '/login'}` } });
  if (customerOnly) {
    clearPanel(res, 'customer');
    writePanels(res, parseSessions(req.cookies.get(PANELS_COOKIE)?.value).filter((p) => p !== 'customer'));
  } else clearAll(res);
  return res;
}
