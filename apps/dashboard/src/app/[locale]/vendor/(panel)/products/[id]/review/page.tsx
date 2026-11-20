import { setRequestLocale } from 'next-intl/server';
import { ReviewNotes } from '@/features/catalog/review-notes';

// CAT-DSH-2: «ملاحظات المراجعة» (131:38124 and its states).
export default async function ReviewNotesPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ReviewNotes id={id} />;
}
