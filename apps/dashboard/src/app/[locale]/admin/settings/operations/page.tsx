import { setRequestLocale } from 'next-intl/server';
import { OperationsSettingsPage } from '@/features/operations/operations-settings';

// SCH-DSH-1: operations settings (118:11181 and its states).
export default async function OperationsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <OperationsSettingsPage />;
}
