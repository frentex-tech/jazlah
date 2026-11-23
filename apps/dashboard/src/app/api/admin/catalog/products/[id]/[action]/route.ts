import { NextResponse, type NextRequest } from 'next/server';
import { adminCatalogBackend } from '@/features/catalog/backend';
import { AvailabilitySchema, FulfilmentSchema, IdSchema, PricesSchema, ReasonSchema } from '@/features/catalog/schema';
import type { Prices } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// Publish a JAZLA draft (POST …/publish); approve or reject (with a reason) a vendor product under review (CAT-DSH-2).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  const b = adminCatalogBackend();
  if (action === 'publish') return withPanelSession(req, 'admin', (token) => b.publish(token, langOf(req), id));
  if (action === 'approve') return withPanelSession(req, 'admin', (token) => b.approve(token, langOf(req), id));
  if (action !== 'reject') return notFound();
  const body = ReasonSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'admin', async (token) => (body.success ? await b.reject(token, langOf(req), id, body.data.reason) : invalidBody(body.error)));
}

// The at-once changes of a JAZLA product: availability, fulfilment, prices (PATCH …/{action}).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  const json = await req.json().catch(() => null);
  const b = adminCatalogBackend();
  if (action === 'availability') {
    const body = AvailabilitySchema.safeParse(json);
    return withPanelSession(req, 'admin', async (token) => (body.success ? await b.setAvailability(token, langOf(req), id, body.data) : invalidBody(body.error)));
  }
  if (action === 'fulfilment') {
    const body = FulfilmentSchema.safeParse(json);
    return withPanelSession(req, 'admin', async (token) => (body.success ? await b.setFulfilment(token, langOf(req), id, body.data.fulfilment) : invalidBody(body.error)));
  }
  if (action === 'prices') {
    const body = PricesSchema.safeParse(json);
    return withPanelSession(req, 'admin', async (token) => (body.success ? await b.setPrices(token, langOf(req), id, body.data as Prices) : invalidBody(body.error)));
  }
  return notFound();
}
