import { getTranslations } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { StateCard } from '@/components/ui/state-card';
import { Link } from '@/i18n/navigation';

/** Outside the panels: the not-found card on the page background, with a way back to sign-in. */
export default async function NotFound() {
  const t = await getTranslations('state.notFound');
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-s24">
      <div className="w-full max-w-[720px]">
        <StateCard
          kind="search"
          title={t('title')}
          body={t('body')}
          action={
            <Link href="/login" className={buttonVariants({ variant: 'secondary' })}>
              {t('home')}
            </Link>
          }
        />
      </div>
    </main>
  );
}
