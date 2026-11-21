import { setRequestLocale } from 'next-intl/server';
import { CouponPage } from '@/features/coupons/coupon-form';

// CRT-DSH-1: a new coupon.
export default async function NewCoupon({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <CouponPage />;
}
