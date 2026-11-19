import { redirect } from '@/i18n/navigation';

// The only settings page so far is the coverage zones; the settings index arrives with its task.
export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/settings/coverage', locale: (await params).locale });
}
