import { expect, type BrowserContext, type Locator, type Page } from '@playwright/test';

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

/**
 * Clicks a client-side link until the page reaches `url`. On a slow machine the first navigation from a freshly loaded
 * list can fail to commit even though its RSC request and chunks answer 200 (CI run 45085538692; the known issue in
 * docs/frontend/not-built-yet.md): the click is repeated, never slept on.
 */
export async function follow(page: Page, link: Locator, url: RegExp) {
  await expect(async () => {
    if (!url.test(page.url())) await link.click({ timeout: 2_000 });
    await expect(page).toHaveURL(url, { timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
}
