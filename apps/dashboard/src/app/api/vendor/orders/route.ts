import type { NextRequest } from 'next/server';
import { listOrders } from '@/features/orders/routes';

export const GET = (req: NextRequest) => listOrders(req, 'vendor');
