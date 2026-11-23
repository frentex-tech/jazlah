import { setRequestLocale } from 'next-intl/server';
import { ReviewQueue } from '@/features/catalog/review-queue';

// CAT-DSH-2: «مراجعة المنتجات» (131:22954 and its states).
export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <ReviewQueue />;
}
