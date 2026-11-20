import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/shell/page-header';
import { StoreProfile } from '@/features/vendor-onboarding/store-profile';

// «ملف المتجر» (131:24074 and its states), in the vendor panel.
export default async function Store({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('store');
  return (
    <>
      <PageHeader breadcrumb={t('breadcrumb')} title={t('title')} start />
      <StoreProfile />
    </>
  );
}
