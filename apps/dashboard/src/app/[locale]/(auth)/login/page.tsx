import { setRequestLocale } from 'next-intl/server';
import { LoginCard, LoginLayout, otpLength } from '@/features/auth/login-layout';
import { LoginFlow } from '@/features/auth/login-flow';
import { isPanel, safeNext } from '@/lib/session';

// One sign-in screen for every panel: `?panel=vendor|kitchen` switches the photo panel and the texts (admin by default).
export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ panel?: string; next?: string; reason?: string }>;
}) {
  setRequestLocale((await params).locale);
  const q = await searchParams;
  const panel = isPanel(q.panel) ? q.panel : 'admin';
  return (
    <LoginLayout panel={panel}>
      <LoginCard>
        <LoginFlow
          panel={panel}
          next={safeNext(q.next) ?? undefined}
          otpLength={otpLength()}
          reason={q.reason === 'disabled' || q.reason === 'suspended' ? q.reason : undefined}
        />
      </LoginCard>
    </LoginLayout>
  );
}
