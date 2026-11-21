import type { NextRequest } from 'next/server';
import { adminVendorsBackend } from '@/features/admin-vendors/backend';
import { ApplicationQuerySchema, queryOf } from '@/features/admin-vendors/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Vendor applications for the admin list's «pending» tab (VND-DSH-2).
export function GET(req: NextRequest) {
  const parsed = ApplicationQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    parsed.success ? await adminVendorsBackend().listApplications(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
