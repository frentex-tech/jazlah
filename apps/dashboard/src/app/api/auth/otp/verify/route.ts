import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { authBackend } from '@/lib/auth/backend';
import { writeSignIn } from '@/lib/auth/cookies';
import { clientIp, isSameOriginJson, statusOf } from '@/lib/auth/request';
import { toE164 } from '@/lib/phone';
import { PANELS, PANELS_COOKIE, panelOfPath, parsePanels, safeNext } from '@/lib/session';

const Body = z.object({
  phone: z.string().max(32),
  panel: z.enum(PANELS),
  code: z.string().regex(/^[\d\s٠-٩۰-۹]{4,16}$/),
  next: z.string().max(512).nullish(),
  lang: z.enum(['ar', 'en']).default('ar'),
});

// Step 2: verify the code, keep the tokens in HTTP-only cookies, and say where to go next.
export async function POST(req: NextRequest) {
  if (!isSameOriginJson(req)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  const phone = parsed.success ? toE164(parsed.data.phone) : null;
  if (!parsed.success || !phone) return NextResponse.json({ code: 'VALIDATION_FAILED' }, { status: 422 });
  const { panel, code, lang } = parsed.data;

  const r = await authBackend().verifyOtp(phone, panel, code.replace(/\s/g, ''), clientIp(req));
  if (!r.ok) return NextResponse.json({ code: r.code, retryAfter: r.retryAfter }, { status: statusOf(r.code) });

  const panels = [...new Set([...parsePanels(req.cookies.get(PANELS_COOKIE)?.value), panel])];
  const next = safeNext(parsed.data.next);
  const prefix = lang === 'en' ? '/en' : '';
  // The page asked for wins when it belongs to this panel; several live panels get the picker.
  const redirect = next && panelOfPath(next) === panel ? next : panels.length > 1 ? `${prefix}/login/choose` : `${prefix}/${panel}`;

  const res = NextResponse.json({ redirect });
  writeSignIn(res, panel, r.data, r.data.principal.phone, panels);
  return res;
}
