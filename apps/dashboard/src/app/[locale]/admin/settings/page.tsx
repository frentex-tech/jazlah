import { redirect } from '@/i18n/navigation';

// The settings open on operations (SCH-DSH-1); coverage zones are its second tab.
export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/settings/operations', locale: (await params).locale });
}
