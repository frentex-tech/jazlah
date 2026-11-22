import { redirect } from '@/i18n/navigation';

// Settings open on the coverage zones; the operations page is the second tab.
// shortcut: open on operations (SCH-DSH-1) once SCH-API-1 is wired; until then it runs on the mock only (#70).
export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  redirect({ href: '/admin/settings/coverage', locale: (await params).locale });
}
