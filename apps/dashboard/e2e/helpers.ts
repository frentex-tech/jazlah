import type { BrowserContext } from '@playwright/test';

/** Signed in to the given panels, with the mock backend's cookies (no UI round trip). */
export async function signInAs(context: BrowserContext, panels: string[]) {
  // Host-only cookies, like the ones the server sets, so the server can delete them on sign-out.
  const base = { url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true };
  await context.addCookies([
    { ...base, name: 'jz_panels', value: panels.join(',') },
    ...panels.flatMap((p) => [
      { ...base, name: `jz_rt_${p}`, value: `mock-rt-${p}-1` },
      { ...base, name: `jz_at_${p}`, value: `mock-at-${p}` },
      { ...base, name: `jz_ph_${p}`, value: '+966 5•• ••• 004' },
    ]),
  ]);
}
