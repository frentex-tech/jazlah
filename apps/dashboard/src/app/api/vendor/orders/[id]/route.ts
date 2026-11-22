import type { NextRequest } from 'next/server';
import { getOrder, type IdCtx } from '@/features/orders/routes';

export const GET = (req: NextRequest, ctx: IdCtx) => getOrder(req, 'vendor', ctx);
