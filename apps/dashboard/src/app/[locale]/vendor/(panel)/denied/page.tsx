import { setRequestLocale } from 'next-intl/server';
import { PanelDenied } from '@/components/shell/route-states';

// Where a page sends staff whose role does not allow it (admin permissions arrive with ADM-API-1, #111).
export default async function Denied({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <PanelDenied panel="vendor" />;
}
