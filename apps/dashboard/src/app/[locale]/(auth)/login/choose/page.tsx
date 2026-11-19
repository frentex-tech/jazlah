import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { CardText, cardClass } from '@/components/ui/card';
import { CardTitle, LoginCard, LoginLayout } from '@/features/auth/login-layout';
import { Link } from '@/i18n/navigation';
import { PANELS, PANELS_COOKIE, parsePanels, refreshCookie } from '@/lib/session';

// Panel picker for a user signed in to several panels. No Figma screen (agreed difference, docs/design/signoff.md):
// the sign-in card with one DS «Card» (16:749) per panel.
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
          {signedIn.map((p) => (
            <li key={p}>
              <Link href={`/${p}`} className={cardClass(true)}>
                <CardText title={t(`${p}.brand`)} body={t(`choose.desc.${p}`)} />
              </Link>
            </li>
          ))}
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
