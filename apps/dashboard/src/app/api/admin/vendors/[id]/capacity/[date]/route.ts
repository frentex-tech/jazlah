import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { operationsBackend } from '@/features/operations/backend';
import { DayLimitSchema, isDate } from '@/features/operations/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

type Ctx = { params: Promise<{ id: string; date: string }> };
const valid = (id: string, date: string) => z.string().uuid().safeParse(id).success && isDate(date); // a real calendar day
const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// One specific date of a vendor's capacity: set its limits, or remove it (back to the vendor's default).
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id, date } = await params;
  if (!valid(id, date)) return notFound();
  const parsed = DayLimitSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (parsed.success ? operationsBackend().setDay(token, langOf(req), id, date, parsed.data) : invalidBody(parsed.error)));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id, date } = await params;
  if (!valid(id, date)) return notFound();
  return withPanelSession(req, 'admin', (token) => operationsBackend().removeDay(token, langOf(req), id, date));
}
