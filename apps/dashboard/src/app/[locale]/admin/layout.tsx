import { cookies } from 'next/headers';
import { getLocale, setRequestLocale } from 'next-intl/server';
import { Shell } from '@/components/shell/shell';
import { operationsBackend } from '@/features/operations/backend';
import { PauseBanner, PauseProvider, PauseSwitch } from '@/features/operations/pause';
import { accessCookie } from '@/lib/session';
import { getStaffName } from '@/lib/staff';

/** The ordering pause, read on every admin page (FR-SCH-07); null when it cannot be read (not allowed, API down). */
async function pauseState() {
  const token = (await cookies()).get(accessCookie('admin'))?.value;
  if (!token) return null;
  const r = await operationsBackend().get(token, await getLocale());
  return r.ok ? r.data.paused : null;
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
