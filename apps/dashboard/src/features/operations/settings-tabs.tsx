'use client';

import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/ui/tabs';
import { useRouter } from '@/i18n/navigation';

const PAGES = { operations: '/admin/settings/operations', coverage: '/admin/settings/coverage' } as const;

/** The admin settings pages (operations, coverage zones): the frames have no settings menu, so the DS Tabs link them. */
export function SettingsTabs({ current }: { current: keyof typeof PAGES }) {
  const t = useTranslations('operations.tabs');
  const router = useRouter();
  return <Tabs label={t('label')} value={current} onChange={(k) => router.push(PAGES[k])} tabs={(['operations', 'coverage'] as const).map((key) => ({ key, label: t(key) }))} />;
}
