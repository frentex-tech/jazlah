import { setRequestLocale } from 'next-intl/server';
import { VendorsList } from '@/features/admin-vendors/vendors-list';

// VND-DSH-2: «المتاجر» (131:16744 and its states).
export default async function Vendors({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <VendorsList />;
}
