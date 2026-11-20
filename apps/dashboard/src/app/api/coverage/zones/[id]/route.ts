import type { NextRequest } from 'next/server';
import { coverageBackend } from '@/features/coverage/backend';
import { UpdateZoneSchema } from '@/features/coverage/schema';
import { invalidBody, langOf } from '@/lib/route';
import { withPanelSession } from '@/lib/auth/panel-session';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const parsed = UpdateZoneSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    parsed.success ? coverageBackend().update(token, langOf(req), id, parsed.data) : invalidBody(parsed.error),
  );
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withPanelSession(req, 'admin', (token) => coverageBackend().remove(token, langOf(req), id));
}
