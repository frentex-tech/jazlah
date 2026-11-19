import { expect, test, type Page } from '@playwright/test';

// LOC-DSH-1 acceptance against the real API. The seed has «وسط وشمال الرياض» (46.55–46.85 E, 24.60–24.85 N) around
// the map's centre; the zone drawn here is west of it, so only the new zone can cover its middle.
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const MAP = 'خريطة مناطق التغطية';

async function mapClick(page: Page, x: number, y: number) {
  const box = (await page.getByRole('application', { name: MAP }).boundingBox())!;
  await page.mouse.move(box.x + x, box.y + y, { steps: 3 });
  await page.mouse.click(box.x + x, box.y + y);
  await page.waitForTimeout(200);
}

async function openEditor(page: Page) {
  await page.goto('/admin/settings/coverage');
  await expect(page.getByRole('heading', { level: 1, name: 'مناطق التغطية' })).toBeVisible();
  await expect(page.getByRole('application', { name: MAP })).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
}

/** Clicks the map in test mode and checks the shown result against GET /v1/public/coverage/check on the API. */
async function testPointMatchesApi(page: Page, x: number, y: number) {
  await mapClick(page, x, y);
  const result = page.getByRole('status').filter({ hasText: /التغطية/ });
  await expect(result).not.toContainText('جارٍ التحقق');
  const [lat, lng] = (await result.locator('p[dir=ltr]').innerText()).split(',').map(Number);
  const api = await (await fetch(`${API_URL}/v1/public/coverage/check?lat=${lat}&lng=${lng}`)).json();
  await expect(result).toContainText(api.covered ? `داخل التغطية: ${api.zone.name.ar}` : 'خارج التغطية');
  return api as { covered: boolean; zone: { name: { ar: string } } | null };
}

test.beforeEach(async ({ page }) => {
  // The seed's admin review account (docs/frontend/auth.md).
  await page.goto('/login');
  await page.getByLabel('رقم الجوال').fill('0500000004');
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await page.getByLabel('رمز التحقق').fill('444444');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test('the seeded zone is listed from the API', async ({ page }) => {
  await openEditor(page);
  await expect(page.getByRole('cell', { name: 'وسط وشمال الرياض', exact: true })).toBeVisible();
});

test('draw and save: the zone persists in the API and renders on reload; the test point matches the API', async ({ page }) => {
  await openEditor(page);
  const name = `منطقة قبول ${Date.now()}`;
  await page.getByRole('button', { name: 'منطقة جديدة' }).first().click();
  for (const [x, y] of [[150, 300], [300, 300], [300, 420], [150, 420], [150, 300]]) await mapClick(page, x, y);
  await page.getByLabel('الاسم بالعربية').fill(name);
  await page.getByLabel('الاسم بالإنجليزية').fill('Acceptance zone');
  await page.getByRole('radio', { name: 'أزرق' }).click();
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'بيانات المنطقة' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('application', { name: MAP })).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'اختبار نقطة' }).click();
  expect(await testPointMatchesApi(page, 225, 360)).toMatchObject({ covered: true, zone: { name: { ar: name } } });
  expect((await testPointMatchesApi(page, 40, 40)).covered).toBe(false);
  await page.getByRole('button', { name: 'إنهاء الاختبار' }).click();

  // Clean up through the UI, which also checks DELETE.
  await page.getByRole('button', { name: `تعديل ${name}` }).click();
  await page.getByRole('button', { name: 'حذف المنطقة' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click();
  await expect(page.getByRole('cell', { name, exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('cell', { name: 'وسط وشمال الرياض', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name, exact: true })).toHaveCount(0);
});
