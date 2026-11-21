import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { IdSchema } from '@/features/catalog/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
  return withPanelSession(req, 'admin', (token) => adminCatalogBackend().confirmUpload(token, langOf(req), id));
}
