import { redirect } from '@/i18n/navigation';

// «التسويق» in the side nav opens the coupons, its only page so far.
export default async function Marketing({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/marketing/coupons', locale: (await params).locale });
}
