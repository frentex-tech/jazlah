import type { NextRequest } from 'next/server';
import { coverageBackend } from '@/features/coverage/backend';
import { CreateZoneSchema } from '@/features/coverage/schema';
import { invalidBody, langOf } from '@/lib/route';
import { withPanelSession } from '@/lib/auth/panel-session';

export function GET(req: NextRequest) {
  return withPanelSession(req, 'admin', (token) => coverageBackend().list(token, langOf(req)));
}

export async function POST(req: NextRequest) {
  const parsed = CreateZoneSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    parsed.success ? coverageBackend().create(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
