import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { StateCard } from '@/components/ui/state-card';

// Frame of «لوحة الطلبات المباشرة» (135:39184). The board is VOP-DSH-1.
export default async function VendorOrders({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
  const ts = await getTranslations('state.empty');
  return (
    <>
      <PageHeader breadcrumb={t('vendor.breadcrumb')} title={t('vendor.title')} />
      {/* Empty frame (135:46966) until the page's own task fills it; its «start first order» action has no target yet. */}
      <StateCard kind="orders" title={ts('title')} body={ts('body')} />
    </>
  );
}
