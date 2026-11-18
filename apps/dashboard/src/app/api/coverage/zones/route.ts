import { NextResponse, type NextRequest } from 'next/server';
import { coverageBackend } from '@/features/coverage/backend';
import { ZoneInputSchema, respond } from '@/features/coverage/schema';
import { panelAuth } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  const auth = panelAuth(req, 'admin');
  if (!auth) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  return respond(await coverageBackend().list(auth));
}

export async function POST(req: NextRequest) {
  const auth = panelAuth(req, 'admin');
  if (!auth) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const parsed = ZoneInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'VALIDATION_FAILED' }, { status: 422 });
  return respond(await coverageBackend().create(auth, parsed.data), 201);
}
