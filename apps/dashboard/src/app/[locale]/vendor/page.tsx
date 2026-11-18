import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { Placeholder } from '@/components/shell/shell';

// Frame of «لوحة الطلبات المباشرة» (135:39184). The board is VOP-DSH-1.
export default async function VendorOrders({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
  return (
    <>
      <PageHeader breadcrumb={t('vendor.breadcrumb')} title={t('vendor.title')} />
      <Placeholder text={t('placeholder')} />
    </>
  );
}
