import { setRequestLocale } from 'next-intl/server';
import { VendorReview } from '@/features/admin-vendors/vendor-review';

// VND-DSH-2: «مراجعة المتجر» (131:18512 and its states), for a pending application or a vendor.
export default async function VendorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <VendorReview id={id} />;
}
