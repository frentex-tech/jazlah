import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Body of the loading frame (135:46807): four KPI cards (the one on the end side fills), then a card of six skeleton
 * rows whose thumb and lines sit on the end side, as drawn. Not async, so client pages show it too (order list and detail, 135:48111, 135:49759).
 */
export function PanelLoading() {
  const t = useTranslations('state');
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
