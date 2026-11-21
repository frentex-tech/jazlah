'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StateCard } from '@/components/ui/state-card';

/** Error frame (135:47170), the panels' error boundary: the shell stays, «retry» re-renders the page. */
export function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('state.error');
  useEffect(() => console.error(error), [error]);
  return <StateCard kind="error" title={t('title')} body={t('body')} action={<Button onClick={reset}>{t('action')}</Button>} />;
}
