import { setRequestLocale } from 'next-intl/server';
import { VendorProducts } from '@/features/catalog/vendor-products';

// CAT-DSH-2: «منتجاتي» (131:25074 and its states).
export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <VendorProducts />;
}
