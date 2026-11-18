import { NextResponse, type NextRequest } from 'next/server';
import { coverageBackend } from '@/features/coverage/backend';
import { ZoneInputSchema, respond } from '@/features/coverage/schema';
import { panelAuth } from '@/lib/auth/guard';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = panelAuth(req, 'admin');
  if (!auth) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  const parsed = ZoneInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ code: 'VALIDATION_FAILED' }, { status: 422 });
  return respond(await coverageBackend().update(auth, (await params).id, parsed.data));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = panelAuth(req, 'admin');
  if (!auth) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  return respond(await coverageBackend().remove(auth, (await params).id));
}
