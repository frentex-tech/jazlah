import { setRequestLocale } from 'next-intl/server';
import { Categories } from '@/features/catalog/categories';

// CAT-DSH-1: «التصنيفات» (131:19875 and its states).
export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <Categories />;
}
