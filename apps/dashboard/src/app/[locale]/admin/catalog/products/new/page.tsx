import { setRequestLocale } from 'next-intl/server';
import { AdminProduct } from '@/features/catalog/admin-product';

// CAT-DSH-1: a new JAZLA product (131:35813).
export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <AdminProduct />;
}
