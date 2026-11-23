import type { NextRequest } from 'next/server';
import { operationsBackend } from '@/features/operations/backend';
import { PausedSchema } from '@/features/operations/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

/** The ordering pause on its own `{isPaused, messageAr, messageEn}` (header switch, pause card); answers the whole settings. */
export async function PUT(req: NextRequest) {
  const parsed = PausedSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? operationsBackend().setPause(token, langOf(req), parsed.data) : invalidBody(parsed.error)));
}
