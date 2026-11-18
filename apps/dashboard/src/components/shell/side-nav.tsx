'use client';

import { SignOut } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname } from '@/i18n/navigation';
import type { Panel } from '@/lib/session';
import { cn } from '@/lib/utils';
import { activeKey, NAV } from './nav';

const itemClass = 'flex h-11 shrink-0 items-center gap-s12 rounded-sm px-s12 text-label-m';

// Figma DS «Side nav» (16:1237), variants role=admin|vendor|kitchen.
export function SideNav({ panel, badges = {} }: { panel: Panel; badges?: Record<string, number> }) {
  const t = useTranslations();
  const pathname = usePathname();
  const current = activeKey(panel, pathname);

  return (
    <nav aria-label={t('nav.label')} className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col gap-s4 overflow-y-auto bg-brand p-s12">
      <div className="flex flex-col items-start gap-[2px] p-s12">
        <Image src="/logo-jazla.svg" alt="JAZLA" width={41} height={40} priority />
        <span className="text-caption text-sand">{t(`panel.${panel}`)}</span>
      </div>

      {NAV[panel].map((item) => {
        const active = item.key === current;
        const count = badges[item.key];
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(itemClass, active ? 'bg-brand-2 text-paper' : 'text-sand hover:bg-brand-2/60')}
          >
            <item.icon
              size={22}
              weight={active ? (item.activeWeight ?? 'fill') : (item.weight ?? 'regular')}
              className={cn('shrink-0', active ? 'text-gold-light' : 'text-sand')}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{t(`nav.${panel}.${item.key}`)}</span>
            {count ? (
              <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-pill bg-gold-light text-caption text-brand">{count}</span>
            ) : null}
          </Link>
        );
      })}

      <div className="flex-1" />

      <form action="/api/auth/logout" method="post">
        <button type="submit" className={cn(itemClass, 'w-full text-sand hover:bg-brand-2/60')}>
          <SignOut size={22} className="shrink-0" aria-hidden />
          <span className="flex-1 text-start">{t('nav.signOut')}</span>
        </button>
      </form>
    </nav>
  );
}
