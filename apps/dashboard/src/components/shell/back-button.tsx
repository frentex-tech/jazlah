'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import type { Panel } from '@/lib/session';

/** Back to where the user came from; opened directly (no history), to the panel's home. */
export function BackButton({ label, panel }: { label: string; panel: Panel }) {
  const router = useRouter();
  return (
    <Button variant="secondary" onClick={() => (window.history.length > 1 ? router.back() : router.push(`/${panel}`))}>
      {label}
    </Button>
  );
}
