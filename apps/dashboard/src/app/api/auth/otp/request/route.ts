import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { authBackend } from '@/lib/auth/backend';
import { clientIp, isSameOriginJson, statusOf } from '@/lib/auth/request';
import { toE164 } from '@/lib/phone';
import { PANELS } from '@/lib/session';

const Body = z.object({ phone: z.string().max(32), panel: z.enum(PANELS), lang: z.enum(['ar', 'en']).default('ar') });

// Step 1: ask the API to send a code. Answers { resendAfterSeconds } or { code } (an API error code).
export async function POST(req: NextRequest) {
  if (!isSameOriginJson(req)) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  const phone = parsed.success ? toE164(parsed.data.phone) : null;
  if (!parsed.success || !phone) return NextResponse.json({ code: 'VALIDATION_FAILED' }, { status: 422 });

  const r = await authBackend().requestOtp(phone, parsed.data.panel, parsed.data.lang, clientIp(req));
  if (!r.ok) return NextResponse.json({ code: r.code, retryAfter: r.retryAfter }, { status: statusOf(r.code) });
  return NextResponse.json({ resendAfterSeconds: r.data.resendAfterSeconds });
}
