import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const PAGES = { operations: '/admin/settings/operations', coverage: '/admin/settings/coverage' } as const;

/**
 * The admin settings pages (operations, coverage zones): the frames have no settings menu, so links drawn as the DS
 * «Tabs» (16:471) join them. Links, not ARIA tabs: each opens its own page.
 */
export function SettingsTabs({ current }: { current: keyof typeof PAGES }) {
  const t = useTranslations('operations.tabs');
  return (
    <nav aria-label={t('label')} className="flex h-12 w-full gap-s4">
      {(Object.keys(PAGES) as (keyof typeof PAGES)[]).map((k) => {
        const active = k === current;
        return (
          <Link key={k} href={PAGES[k]} aria-current={active ? 'page' : undefined} className={cn('flex flex-col justify-between px-s16 text-label-m', active ? 'text-ember' : 'text-ink-2')}>
            {t(k)}
            <span aria-hidden className={cn('w-full', active ? 'h-[3px] bg-ember' : 'h-px bg-line')} />
          </Link>
        );
      })}
    </nav>
  );
}
