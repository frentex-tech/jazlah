import { Bell, MagnifyingGlass, User } from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';

// Figma DS «Top bar» (16:1239): search on the start side, user and notifications on the end side.
export async function TopBar({ userName, extra }: { userName: string; extra?: React.ReactNode }) {
  const t = await getTranslations('topBar');
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-s16 bg-paper px-s24">
      <label className="flex h-10 w-[360px] items-center gap-s8 rounded-sm border border-line bg-bg px-s12">
        <MagnifyingGlass size={18} className="shrink-0 text-ink-2" aria-hidden />
        <input
          type="search"
          placeholder={t('search')}
          aria-label={t('search')}
          className="min-w-0 flex-1 bg-transparent text-body-m text-ink outline-none placeholder:text-muted"
        />
      </label>
      <div className="flex items-center gap-s12">
        {extra}
        {/* Figma shows the name's first letter; the API has no staff name yet (see README, API gaps). */}
        <span aria-hidden className="flex size-9 items-center justify-center rounded-pill bg-brand text-gold-light">
          <User size={18} weight="fill" />
        </span>
        <bdi dir="ltr" className="text-label-m text-ink">{userName}</bdi>
        <button type="button" aria-label={t('notifications')} className="flex size-10 items-center justify-center rounded-pill bg-bg">
          <Bell size={20} className="text-ink" aria-hidden />
        </button>
      </div>
    </header>
  );
}
