import { getTranslations } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { StateCard } from '@/components/ui/state-card';
import { Link } from '@/i18n/navigation';
import type { Panel } from '@/lib/session';
import { BackButton } from './back-button';

export { PanelLoading } from './panel-loading';

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
