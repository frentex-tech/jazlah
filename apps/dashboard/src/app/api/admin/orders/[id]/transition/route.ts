import type { NextRequest } from 'next/server';
import { transitionOrder, type IdCtx } from '@/features/orders/routes';

export const POST = (req: NextRequest, ctx: IdCtx) => transitionOrder(req, 'admin', ctx);
