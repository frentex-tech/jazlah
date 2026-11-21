import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ApplicationStatus } from '@/features/vendor-onboarding/application-status';
import { CustomerSignIn, PublicFrame, customerSession } from '@/features/vendor-onboarding/public-frame';

// Status of the applicant's latest application (VND-DSH-1), outside the staff shell like the application itself.
export default async function Application({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; rest?: string[] }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const { locale, rest } = await params;
  if (rest?.length) notFound();
  setRequestLocale(locale);
  const session = await customerSession();
  if (!session) return <CustomerSignIn next={`${locale === 'en' ? '/en' : ''}/vendor/application`} reason={(await searchParams).reason} />;
  return (
    <PublicFrame signOut>
      <ApplicationStatus phone={session.phone} />
    </PublicFrame>
  );
}
