import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { StateCard } from '@/components/ui/state-card';
import { Button } from '@/components/ui/button';

// Frame of «نظرة عامة» (135:46622). The KPIs and charts are ADM-DSH-1.
export default async function AdminOverview({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
  const ts = await getTranslations('state.empty');
  return (
    <>
      <PageHeader
        breadcrumb={t('admin.breadcrumb')}
        title={t('admin.title')}
        actions={
          <>
            <Button>{t('admin.export')}</Button>
            <Button variant="secondary">{t('admin.range')}</Button>
          </>
        }
      />
      {/* Empty frame (135:46966) until the page's own task fills it; its «start first order» action has no target yet. */}
      <StateCard kind="orders" title={ts('title')} body={ts('body')} />
    </>
  );
}
