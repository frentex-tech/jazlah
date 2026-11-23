import { redirect } from '@/i18n/navigation';

// Settings open on the operations page (SCH-DSH-1); the coverage zones are the other tab.
export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/settings/operations', locale: (await params).locale });
}
