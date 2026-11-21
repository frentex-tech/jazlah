import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { LoginCard, LoginLayout, otpLength } from '@/features/auth/login-layout';
import { LoginFlow } from '@/features/auth/login-flow';
import { Link } from '@/i18n/navigation';
import { ClearDrafts, CustomerSignOut } from './sign-out';
import { OWNER_COOKIE, PANELS_COOKIE, parseSessions, phoneCookie, refreshCookie } from '@/lib/session';

/**
 * The applicant's customer session: the masked phone it signed in with, or null when there is none. A refresh token
 * left after the idle timeout counts as none; the middleware has already ended it at the API and cleared the cookies.
 */
export async function customerSession(): Promise<{ phone: string; owner: string } | null> {
  const jar = await cookies();
  const live = parseSessions(jar.get(PANELS_COOKIE)?.value).includes('customer') && !!jar.get(refreshCookie('customer'))?.value;
  return live ? { phone: jar.get(phoneCookie('customer'))?.value ?? '', owner: jar.get(OWNER_COOKIE)?.value ?? '' } : null;
}

/** Phone and code for the applicant (410:40299, 410:40343): the staff sign-in with `audience: customer`. */
export function CustomerSignIn({ next, reason }: { next?: string; reason?: string }) {
  return (
    <LoginLayout panel="customer">
      <LoginCard>
        <LoginFlow panel="customer" next={next} otpLength={otpLength()} reason={reason === 'disabled' ? 'disabled' : undefined} />
        {reason && <ClearDrafts />}
      </LoginCard>
    </LoginLayout>
  );
}

/**
 * The public frame of the application and status pages (410:39654 «public bar»): emblem and «Vendor sign-up» on the
 * start side, then the page's link: sign out of the customer session when there is one, else sign in to the vendor panel.
 */
export async function PublicFrame({ signOut, children }: { signOut?: boolean; children: React.ReactNode }) {
  const t = await getTranslations('apply.bar');
  const locale = await getLocale();
  const link = 'text-[14px] font-medium text-ember hover:underline';
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-line bg-paper px-12 py-[14px] max-md:px-s20">
        <div className="flex items-center gap-[10px]">
          <Image src="/logo-jazla-on-light.svg" alt="JAZLA" width={45} height={44} priority />
          <span className="text-[14px] text-muted max-md:hidden">{t('brand')}</span>
        </div>
        {signOut ? (
          <CustomerSignOut locale={locale} label={t('signOut')} className={link} />
        ) : (
          <Link href="/login?panel=vendor" className={link}>
            {t('signIn')}
          </Link>
        )}
      </header>
      <main className="flex flex-col items-center px-s20 pb-16 pt-10 max-md:pb-s32 max-md:pt-s20">
        <div className="flex w-full max-w-[760px] flex-col gap-s24">{children}</div>
      </main>
    </div>
  );
}
