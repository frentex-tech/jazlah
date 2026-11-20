import type { NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { CreateRuleSchema, ListQuerySchema, queryOf } from '@/features/catalog/schema';
import type { CreateRule } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// The global cutting × packaging rules: the product form's compatibility matrix (CAT-DSH-1).
export function GET(req: NextRequest) {
  const query = ListQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    query.success ? await adminCatalogBackend().listRules(token, langOf(req), query.data) : invalidBody(query.error),
  );
}

export async function POST(req: NextRequest) {
  const body = CreateRuleSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) =>
    body.success ? await adminCatalogBackend().createRule(token, langOf(req), body.data as CreateRule) : invalidBody(body.error),
  );
}
