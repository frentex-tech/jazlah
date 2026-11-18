import { redirect } from 'next/navigation';

// Everyone starts at the sign-in screen, which routes staff to their panel.
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === 'ar' ? '/login' : `/${locale}/login`);
}
