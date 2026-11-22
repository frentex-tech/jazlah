import type { NextRequest } from 'next/server';
import { operationsBackend } from '@/features/operations/backend';
import { OperationsPatchSchema } from '@/features/operations/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

export function GET(req: NextRequest) {
  return withPanelSession(req, 'admin', (token) => operationsBackend().get(token, langOf(req)));
}

/** Only the keys sent change: the page sends its sections (the pause has its own route, ./pause). */
export async function PUT(req: NextRequest) {
  const parsed = OperationsPatchSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? operationsBackend().update(token, langOf(req), parsed.data) : invalidBody(parsed.error)));
}
