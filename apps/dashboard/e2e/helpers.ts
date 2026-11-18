import type { BrowserContext } from '@playwright/test';

/** Pretend to be signed in to the given panels (the middleware only reads this cookie). */
export async function signInAs(context: BrowserContext, panels: string[]) {
  await context.addCookies([{ name: 'jz_panels', value: panels.join(','), domain: 'localhost', path: '/', httpOnly: true }]);
}
