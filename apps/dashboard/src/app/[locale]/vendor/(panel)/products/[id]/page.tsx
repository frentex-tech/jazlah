import { setRequestLocale } from 'next-intl/server';
import { VendorProduct } from '@/features/catalog/vendor-product';

// CAT-DSH-2: a vendor product's form (131:35405 and its states).
export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <VendorProduct id={id} />;
}
