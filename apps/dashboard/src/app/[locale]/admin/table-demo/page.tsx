import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { OrdersTable } from '@/features/table-demo/orders-table';

// DataTable demo against a mocked endpoint (APP-DSH-1). `?fail=1` shows the error state.
export default async function TableDemo({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('pages.tableDemo');
  return (
    <>
      <PageHeader breadcrumb={t('breadcrumb')} title={t('title')} />
      <OrdersTable />
    </>
  );
}
