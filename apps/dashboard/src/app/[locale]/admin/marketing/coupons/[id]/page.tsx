import { setRequestLocale } from 'next-intl/server';
import { CouponPage } from '@/features/coupons/coupon-form';

// CRT-DSH-1: one coupon, its usage, edit and deactivate.
export default async function Coupon({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <CouponPage id={id} />;
}
