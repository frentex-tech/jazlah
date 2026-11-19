import { getTranslations } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { Panel } from '@/lib/session';
import { BackButton } from './back-button';

/**
 * Body of the loading frame (135:46807): four KPI cards (the one on the end side fills), then a card of six skeleton
 * rows whose thumb and lines sit on the end side, as drawn.
 */
export async function PanelLoading() {
  const t = await getTranslations('state');
  const card = 'rounded-md border border-line bg-paper';
  return (
    <div role="status" aria-label={t('loading')} className="flex w-full flex-col gap-s24">
      <div className="flex w-full gap-s24">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn(card, 'flex h-[104px] flex-col items-start gap-s12 p-s20', i === 3 ? 'flex-1' : 'w-[270px] shrink-0')}>
            <Skeleton className="w-[120px]" />
            <Skeleton className="h-7 w-20 rounded-sm" />
          </div>
        ))}
      </div>
      <div className={cn(card, 'flex w-full flex-col gap-s12 p-s16')}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={cn(card, 'flex items-center justify-end gap-s12 p-s12')}>
            <Skeleton className="size-16 rounded-sm" />
            <div className="flex flex-col items-start gap-s8">
              <Skeleton className="w-40" />
              <Skeleton className="w-[110px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** An address in a panel that has no page (yet): the shell stays, with the empty-state card. */
export async function PanelNotFound({ panel }: { panel: Panel }) {
  const t = await getTranslations('state.notFound');
  return (
    <StateCard
      kind="search"
      title={t('title')}
      body={t('body')}
      action={
        <Link href={`/${panel}`} className={buttonVariants({ variant: 'secondary' })}>
          {t('action')}
        </Link>
      }
    />
  );
}

/** Denied frame (135:47334): signed in to the panel, but not allowed this page. */
export async function PanelDenied({ panel }: { panel: Panel }) {
  const t = await getTranslations('state.denied');
  return <StateCard kind="denied" title={t('title')} body={t('body')} action={<BackButton label={t('action')} panel={panel} />} />;
}
