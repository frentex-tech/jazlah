import { setRequestLocale } from 'next-intl/server';
import { VendorProduct } from '@/features/catalog/vendor-product';

// CAT-DSH-2: a new vendor product, with the shared form (131:35813).
export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <VendorProduct />;
}
