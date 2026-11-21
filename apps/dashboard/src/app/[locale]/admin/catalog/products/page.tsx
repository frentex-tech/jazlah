import { setRequestLocale } from 'next-intl/server';
import { ProductsList } from '@/features/catalog/products-list';

// CAT-DSH-1: «المنتجات» (131:21286 and its states).
export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <ProductsList />;
}
