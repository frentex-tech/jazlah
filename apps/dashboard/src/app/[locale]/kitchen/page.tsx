import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { Placeholder } from '@/components/shell/shell';
import { Button } from '@/components/ui/button';

// Frame of «لوحة المطبخ» (131:79506). The board and its tabs are KIT-DSH-1.
export default async function KitchenOrders({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
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
      <Placeholder text={t('placeholder')} />
    </>
  );
}
