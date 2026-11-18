import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { Placeholder } from '@/components/shell/shell';
import { Button } from '@/components/ui/button';

// Frame of «نظرة عامة» (135:46622). The KPIs and charts are ADM-DSH-1.
export default async function AdminOverview({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages');
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
      <Placeholder text={t('placeholder')} />
    </>
  );
}
