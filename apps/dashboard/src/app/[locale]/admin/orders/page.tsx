import { setRequestLocale } from 'next-intl/server';
import { ordersBackend } from '@/features/orders/backend';
import { OrdersList } from '@/features/orders/orders-list';

// ORD-DSH-1: «الطلبات» (135:47501 and its states). New orders are pushed when the backend can, else polled.
export default async function Orders({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <OrdersList panel="admin" live={!!ordersBackend().watch} />;
}
