import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ApplyWizard } from '@/features/vendor-onboarding/apply-wizard';
import { CustomerSignIn, PublicFrame, customerSession } from '@/features/vendor-onboarding/public-frame';

// The vendor application (VND-DSH-1) is open to visitors, so it sits outside the staff shell in (panel): a visitor
// signs in with a customer session first, then fills the form. Deeper addresses are the plain localised not-found.
export default async function Apply({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; rest?: string[] }>;
  searchParams: Promise<{ reapply?: string; reason?: string }>;
}) {
  const { locale, rest } = await params;
  if (rest?.length) notFound();
  setRequestLocale(locale);
  const q = await searchParams;
  const session = await customerSession();
  if (!session) return <CustomerSignIn reason={q.reason} />;
  return (
    <PublicFrame signOut>
      <ApplyWizard phone={session.phone} reapply={q.reapply === '1'} />
    </PublicFrame>
  );
}
