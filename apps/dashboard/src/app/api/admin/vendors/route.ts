import type { NextRequest } from 'next/server';
import { adminVendorsBackend } from '@/features/admin-vendors/backend';
import { VendorQuerySchema, queryOf } from '@/features/admin-vendors/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Vendors for the admin list's «active» and «suspended» tabs (VND-DSH-2).
export function GET(req: NextRequest) {
  const parsed = VendorQuerySchema.safeParse(queryOf(req.nextUrl));
  return withPanelSession(req, 'admin', async (token) =>
    parsed.success ? await adminVendorsBackend().listVendors(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
