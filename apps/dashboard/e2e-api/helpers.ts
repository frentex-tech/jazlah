import { expect, type Locator, type Page } from '@playwright/test';

// The seeded API's review accounts (docs/frontend/auth.md), plus one fresh applicant the CI job adds to
// AUTH_REVIEW_ACCOUNTS (.github/workflows/ci-dashboard.yml): fixed codes, no SMS.
export const API_URL = process.env.API_URL ?? 'http://localhost:3000';
export const ADMIN = { phone: '0500000004', code: '444444' };
export const VENDOR = { phone: '0500000002', code: '222222' }; // owner of ملحمة النخبة
export const APPLICANT = { phone: '0500000041', code: '414141' }; // a phone the seed does not know
/** Digits unique to this run, for names (Arabic names stay Arabic plus digits). */
export const RUN = String(Date.now()).slice(-6);
export const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
export const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% acceptance\n') });

/** Phone and code on the sign-in form that is on the page (staff /login, or the application's customer sign-in). */
export async function signIn(page: Page, who: { phone: string; code: string }) {
  await page.getByLabel('رقم الجوال').fill(who.phone);
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await page.getByLabel('رمز التحقق').fill(who.code);
  await page.getByRole('button', { name: 'تأكيد' }).click();
}

/** A staff panel, signed in through the dashboard's own sign-in page. */
export async function signInTo(page: Page, panel: 'admin' | 'vendor', who: { phone: string; code: string }) {
  await page.goto(`/login?panel=${panel}`);
  await signIn(page, who);
  // The vendor panel opens on its orders (/vendor redirects to /vendor/orders): wait for the page it lands on.
  await expect(page).toHaveURL(new RegExp(panel === 'vendor' ? '/vendor/orders$' : '/admin$'));
}

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API_URL}${path}`);
  expect(r.ok, `GET ${path}: ${r.status}`).toBe(true);
  return (await r.json()) as T;
}

/** The public catalog's card of a product, by its English name (GET /v1/public/products?q=). */
export async function publicCard(nameEn: string) {
  const page = await apiGet<{ items: { id: string; name: { en: string }; minPriceHalalas: number | null }[] }>(
    `/v1/public/products?q=${encodeURIComponent(nameEn)}&limit=50`,
  );
  return page.items.find((p) => p.name.en === nameEn) ?? null;
}

export const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible({ timeout: 15_000 });
export const rowOf = (page: Page, table: Locator, name: string) => table.getByRole('row').filter({ has: page.getByText(name, { exact: true }) });
