import { CaretLeft, CookingPot, ListChecks, ChartLineUp } from '@phosphor-icons/react/dist/ssr';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { CardTitle, LoginCard, LoginLayout } from '@/features/auth/login-layout';
import { Link } from '@/i18n/navigation';
import { PANELS, PANELS_COOKIE, parsePanels, refreshCookie } from '@/lib/session';

const icons = { admin: ChartLineUp, vendor: ListChecks, kitchen: CookingPot };

// Panel picker for a user signed in to several panels. No Figma screen: built from the sign-in card and Nav item styles.
export default async function ChoosePanel({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations('login');
  const jar = await cookies();
  const signedIn = parsePanels(jar.get(PANELS_COOKIE)?.value).filter((p) => jar.get(refreshCookie(p))?.value);
  const others = PANELS.filter((p) => !signedIn.includes(p));
  return (
    <LoginLayout panel="admin">
      <LoginCard>
        <CardTitle title={t('choose.title')} subtitle={t('choose.body')} />
        <ul className="flex flex-col gap-s12">
          {signedIn.map((p) => {
            const Icon = icons[p];
            return (
              <li key={p}>
                <Link
                  href={`/${p}`}
                  className="flex h-16 items-center gap-s12 rounded-md border border-line bg-paper px-s16 text-h3 text-ink hover:border-ember"
                >
                  <span className="flex size-10 items-center justify-center rounded-pill bg-brand">
                    <Icon size={22} weight="fill" className="text-gold-light" aria-hidden />
                  </span>
                  <span className="flex-1">{t(`${p}.brand`)}</span>
                  <CaretLeft size={18} className="text-ink-2 ltr:-scale-x-100" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        {others.length > 0 && (
          <Link href={`/login?panel=${others[0]}`} className="self-start text-label-m text-ember hover:underline">
            {t('choose.addAnother')}
          </Link>
        )}
      </LoginCard>
    </LoginLayout>
  );
}
