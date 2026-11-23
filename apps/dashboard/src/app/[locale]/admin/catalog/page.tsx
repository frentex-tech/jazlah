import { redirect } from '@/i18n/navigation';

// «المنتجات» in the side nav opens the products list; the categories are one click away from it.
export default async function Catalog({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/catalog/products', locale: (await params).locale });
}
