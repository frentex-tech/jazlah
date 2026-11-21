import { setRequestLocale } from 'next-intl/server';
import { CouponsList } from '@/features/coupons/coupons-list';

// CRT-DSH-1: «الكوبونات» (no Figma frame, built from the DS).
export default async function Coupons({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <CouponsList />;
}
