import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { StateCard } from '@/components/ui/state-card';
import { Button } from '@/components/ui/button';

// Frame of «لوحة المطبخ» (131:79506). The board and its tabs are KIT-DSH-1.
export default async function KitchenOrders({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
  const ts = await getTranslations('state.empty');
  return (
    <>
      <PageHeader
        breadcrumb={t('kitchen.breadcrumb')}
        title={t('kitchen.title')}
        actions={
          <>
            <Button>{t('kitchen.print')}</Button>
            <Button variant="secondary">{t('kitchen.export')}</Button>
          </>
        }
      />
      {/* Empty frame (135:46966) until the page's own task fills it; its «start first order» action has no target yet. */}
      <StateCard kind="orders" title={ts('title')} body={ts('body')} />
    </>
  );
}
