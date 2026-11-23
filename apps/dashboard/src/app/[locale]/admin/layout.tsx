import { getLocale, setRequestLocale } from 'next-intl/server';
import { Shell } from '@/components/shell/shell';
import { operationsBackend } from '@/features/operations/backend';
import { PauseBanner, PauseProvider, PauseSwitch } from '@/features/operations/pause';
import { getStaffName } from '@/lib/staff';

/**
 * The ordering pause, read on every admin page (FR-SCH-07) from the public client settings, so every admin sees it; null
 * when it cannot be read (API down, or NOT_IMPLEMENTED until SCH-API-1 lands): the header switch and banner are hidden.
 */
async function pauseState() {
  try {
    const r = await operationsBackend().pause(await getLocale());
    return r.ok ? r.data : null;
  } catch {
    return null;
  }
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return (
    <PauseProvider initial={await pauseState()}>
      <Shell panel="admin" userName={await getStaffName('admin')} topBarExtra={<PauseSwitch />} banner={<PauseBanner />}>
        {children}
      </Shell>
    </PauseProvider>
  );
}
