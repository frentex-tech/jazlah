import { NextResponse, type NextRequest } from 'next/server';
import { vendorCatalogBackend } from '@/features/catalog/vendor-backend';
import { AvailabilitySchema, FulfilmentSchema, IdSchema, PricesSchema } from '@/features/catalog/schema';
import type { Prices } from '@/features/catalog/types';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

const notFound = () => NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

// «Submit for review» (POST …/submit).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (action !== 'submit' || !IdSchema.safeParse(id).success) return notFound();
  return withPanelSession(req, 'vendor', (token) => vendorCatalogBackend().submit(token, langOf(req), id));
}

// The at-once changes, no review: availability, fulfilment, prices (PATCH …/{action}).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!IdSchema.safeParse(id).success) return notFound();
  const json = await req.json().catch(() => null);
  const b = vendorCatalogBackend();
  if (action === 'availability') {
    const body = AvailabilitySchema.safeParse(json);
    return withPanelSession(req, 'vendor', async (token) => (body.success ? await b.setAvailability(token, langOf(req), id, body.data) : invalidBody(body.error)));
  }
  if (action === 'fulfilment') {
    const body = FulfilmentSchema.safeParse(json);
    return withPanelSession(req, 'vendor', async (token) => (body.success ? await b.setFulfilment(token, langOf(req), id, body.data.fulfilment) : invalidBody(body.error)));
  }
  if (action === 'prices') {
    const body = PricesSchema.safeParse(json);
    return withPanelSession(req, 'vendor', async (token) => (body.success ? await b.setPrices(token, langOf(req), id, body.data as Prices) : invalidBody(body.error)));
  }
  return notFound();
}
