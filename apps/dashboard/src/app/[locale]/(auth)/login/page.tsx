import { getTranslations } from 'next-intl/server';

// Staff sign-in. UI only in APP-DSH-1; built and wired in ACC-DSH-1.
export default async function LoginPage() {
  const t = await getTranslations('pages');
  return <main className="flex min-h-screen items-center justify-center text-h2">{t('login')}</main>;
}
