import { setRequestLocale } from 'next-intl/server';
import { AdminProduct } from '@/features/catalog/admin-product';

// CAT-DSH-1: a JAZLA product's form (131:35405 and its states).
export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <AdminProduct id={id} />;
}
