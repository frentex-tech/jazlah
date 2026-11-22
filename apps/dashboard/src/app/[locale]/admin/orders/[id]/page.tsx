import { setRequestLocale } from 'next-intl/server';
import { hasAdminOrderActions } from '@/features/orders/backend';
import { OrderDetail } from '@/features/orders/order-detail';

// ORD-DSH-1: «تفاصيل الطلب» (135:49134 and its states, label 135:49613).
export default async function OrderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <OrderDetail panel="admin" id={id} adminActions={hasAdminOrderActions()} />;
}
