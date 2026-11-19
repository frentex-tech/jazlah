import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// The mock seeds «شمال الرياض» north of the map's centre (Riyadh, zoom 10); positions are relative to the map box.
async function mapClick(page: Page, x: number, y: number) {
  const box = (await page.getByRole('application', { name: 'خريطة مناطق التغطية' }).boundingBox())!;
  // terra-draw reads pointer moves between clicks, and fast clicks would read as a double click.
  await page.mouse.move(box.x + x, box.y + y, { steps: 3 });
  await page.mouse.click(box.x + x, box.y + y);
  await page.waitForTimeout(200);
}

test.beforeEach(async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/settings/coverage');
  await expect(page.getByRole('heading', { level: 1, name: 'مناطق التغطية' })).toBeVisible();
  // The map is ready (and terra-draw started) once its style and first tiles loaded.
  await expect(page.getByRole('application', { name: 'خريطة مناطق التغطية' })).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
});

test('lists the zones and marks the settings item active', async ({ page }) => {
  await expect(page.getByRole('cell', { name: 'شمال الرياض', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).locator('[aria-current=page]')).toHaveText('الإعدادات');
});

test('the test-point tool matches the API result', async ({ page, request }) => {
  await page.getByRole('button', { name: 'اختبار نقطة' }).click();
  for (const [x, y, expected] of [
    [535, 105, 'داخل التغطية: شمال الرياض'],
    [200, 300, 'خارج التغطية'],
  ] as const) {
    await mapClick(page, x, y);
    const result = page.getByRole('status').filter({ hasText: /التغطية/ });
    await expect(result).toContainText(expected);
    const [lat, lng] = (await result.locator('p[dir=ltr]').innerText()).split(',').map(Number);
    const api = await (await request.get(`/api/coverage/check?lat=${lat}&lng=${lng}`)).json();
    expect(api.covered).toBe(expected.startsWith('داخل'));
  }
});

test('a drawn and saved zone persists after reload, and can be deleted', async ({ page }) => {
  const name = `منطقة اختبار ${Date.now()}`;
  await page.getByRole('button', { name: 'منطقة جديدة' }).first().click();
  for (const [x, y] of [[700, 200], [850, 200], [850, 320], [700, 320], [700, 200]]) await mapClick(page, x, y);
  await expect(page.getByRole('heading', { level: 2, name: 'منطقة جديدة' })).toBeVisible();
  await page.getByLabel('الاسم بالعربية').fill(name);
  await page.getByLabel('الاسم بالإنجليزية').fill('Test zone');
  await page.getByRole('radio', { name: 'أزرق' }).click();
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'بيانات المنطقة' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
  // The saved polygon came back and is on the map: a point in its middle is covered by it.
  await expect(page.getByRole('application', { name: 'خريطة مناطق التغطية' })).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  await page.getByRole('button', { name: 'اختبار نقطة' }).click();
  await mapClick(page, 775, 260);
  await expect(page.getByRole('status').filter({ hasText: /التغطية/ })).toContainText(`داخل التغطية: ${name}`);
  await page.getByRole('button', { name: 'إنهاء الاختبار' }).click();

  await page.getByRole('button', { name: `تعديل ${name}` }).click();
  await page.getByRole('button', { name: 'حذف المنطقة' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click();
  await expect(page.getByRole('cell', { name, exact: true })).toHaveCount(0);
});

test('saving needs both names', async ({ page }) => {
  await page.getByRole('button', { name: 'منطقة جديدة' }).first().click();
  for (const [x, y] of [[900, 300], [1000, 300], [1000, 400], [900, 300]]) await mapClick(page, x, y);
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'هذا الحقل مطلوب' })).toHaveCount(2);
});

test('coverage API routes need an admin session', async ({ playwright, baseURL }) => {
  const anon = await playwright.request.newContext({ baseURL });
  expect((await anon.get('/api/coverage/zones')).status()).toBe(401);
  expect((await anon.get('/api/coverage/check')).status()).toBe(400);
  // Mutations must come from our own pages, even with a session cookie.
  expect((await anon.delete('/api/coverage/zones/x', { headers: { 'sec-fetch-site': 'cross-site' } })).status()).toBe(403);
});

async function drawZone(page: Page, name: string) {
  await page.getByRole('button', { name: 'منطقة جديدة' }).first().click();
  for (const [x, y] of [[700, 200], [850, 200], [850, 320], [700, 320], [700, 200]]) await mapClick(page, x, y);
  await page.getByLabel('الاسم بالعربية').fill(name);
  await page.getByLabel('الاسم بالإنجليزية').fill('Test zone');
}

test('an expired access token is refreshed inside the API route, and the save goes through', async ({ page, context }) => {
  await context.clearCookies({ name: 'jz_at_admin' });
  const name = `منطقة تجديد ${Date.now()}`;
  await drawZone(page, name);
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === 'jz_at_admin')?.value).toBe('mock-at');
  expect(cookies.find((c) => c.name === 'jz_rt_admin')?.value).not.toBe('mock-rt-admin-1'); // the one-use token was rotated
});

test('when the session is over, saving goes to sign-in and the drawing comes back afterwards', async ({ page, context }) => {
  const name = `منطقة جلسة ${Date.now()}`;
  await drawZone(page, name);
  await context.clearCookies({ name: 'jz_at_admin' });
  await context.addCookies([{ name: 'jz_rt_admin', value: 'revoked', url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true }]);
  await page.getByRole('button', { name: 'حفظ' }).click();

  await expect(page).toHaveURL(/\/login\?panel=admin&next=%2Fadmin%2Fsettings%2Fcoverage/);
  await page.getByLabel('رقم الجوال').fill('0500000004');
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await page.getByLabel('رمز التحقق').fill('444444');
  await page.getByRole('button', { name: 'تأكيد' }).click();

  await expect(page).toHaveURL(/\/admin\/settings\/coverage$/);
  await expect(page.getByText('استرجعنا ما رسمته قبل تسجيل الدخول')).toBeVisible();
  await expect(page.getByLabel('الاسم بالعربية')).toHaveValue(name);
  await page.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
});
