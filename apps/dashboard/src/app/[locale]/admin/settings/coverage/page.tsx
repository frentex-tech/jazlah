import { setRequestLocale } from 'next-intl/server';
import { CoverageEditor } from '@/features/coverage/coverage-editor';

// LOC-DSH-1: coverage zones map editor.
export default async function CoveragePage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <CoverageEditor />;
}
