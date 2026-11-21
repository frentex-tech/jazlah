import type { NextRequest } from 'next/server';
import { orderEvents } from '@/features/orders/routes';

export const dynamic = 'force-dynamic';
export const GET = (req: NextRequest) => orderEvents(req, 'vendor');
