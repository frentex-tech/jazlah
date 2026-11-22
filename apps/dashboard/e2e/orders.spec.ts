import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/orders/backend.mock.ts): seeds follow 135:47501 (JZ-261110-0482 «سعد العتيبي», مجازر الفلاح, preparing;
// JZ-261110-0481 ذبائح الرياض, delivered …). The vendor session is مجازر الفلاح. One server and one mock store for the
// whole run: every test that changes an order places its own first (POST /api/mock-orders, test builds only).

const table = (page: Page) => page.getByRole('table', { name: 'الطلبات' });
const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
type Placed = { id: string; number: string };
/** The first order the admin list finds (from the page, so its session cookies go along). */
async function find(page: Page, q: string) {
  if (page.url() === 'about:blank') await page.goto('/admin/orders');
  const p = await page.evaluate(async (u) => (await fetch(u)).json(), `/api/admin/orders?q=${q}`);
  return (p as { items: Placed[] }).items[0]!;
}
/** Places an order through the mock route from one of our pages, so the session cookies and our origin go along (the route checks both). */
async function place(context: BrowserContext, body: { vendor?: string; customer?: string; method?: string } = {}) {
  const tab = await context.newPage();
  await tab.goto('/login/vendor.jpg');
  const res = await tab.evaluate(async (b) => {
    const r = await fetch('/api/mock-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    return { status: r.status, body: r.ok ? ((await r.json()) as unknown) : null };
  }, body);
  await tab.close();
  expect(res.status).toBe(201);
  return res.body as Placed;
}

test('the admin list filters by status, store, method and date, and shows the empty state', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/orders');
  await expect(page.getByRole('heading', { level: 1, name: 'الطلبات' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'الطلبات' })).toHaveAttribute('aria-current', 'page');
  await expect(table(page).getByText('JZ-261110-0481')).toBeVisible();

  await page.getByLabel('الحالة', { exact: true }).selectOption('preparing');
  await expect(page.getByText('الحالة: قيد التجهيز')).toBeVisible();
  await expect(table(page).getByText('JZ-261110-0482')).toBeVisible();
  await expect(table(page).getByText('JZ-261108-0476')).toBeVisible();
  await expect(table(page).getByText('JZ-261110-0481')).toHaveCount(0);

  await page.getByLabel('المتجر', { exact: true }).selectOption({ label: 'مجازر الفلاح' });
  await expect(page.getByText('المتجر: مجازر الفلاح')).toBeVisible();
  await expect(table(page).getByText('JZ-261108-0476')).toHaveCount(0);
  await expect(table(page).getByText('JZ-261110-0482')).toBeVisible();

  await page.getByRole('button', { name: 'مسح الكل', exact: true }).click();
  await page.getByLabel('طريقة الدفع').selectOption('applepay');
  await expect(table(page).getByRole('row')).toHaveCount(3); // header + the two Apple Pay seeds
  await page.getByRole('button', { name: 'مسح الكل', exact: true }).click();

  await page.getByLabel('التاريخ', { exact: true }).fill('2026-01-01');
  await expect(page.getByText('لا توجد طلبات مطابقة')).toBeVisible();
  // The bar stays: the date chip can be removed on its own.
  await expect(page.getByRole('button', { name: /^مسح الكل: التاريخ/ })).toBeVisible();
  await page.getByRole('button', { name: 'مسح المرشحات' }).click();
  await expect(table(page).getByText('JZ-261110-0481')).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'بحث', exact: true });
  await search.fill('لا أحد بهذا الاسم');
  await expect(page.getByText('لا توجد طلبات مطابقة')).toBeVisible();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('لا أحد بهذا الاسم');
  await search.fill('0479');
  await expect(table(page).getByRole('row')).toHaveCount(2);
  await expect(table(page).getByText('منيرة الشمري')).toBeVisible();
});

test('a new order appears live, tinted, without a refresh; a vendor only gets its own', async ({ page, context }) => {
  await signInAs(context, ['admin', 'vendor']);
  const vendorPage = await context.newPage();
  await vendorPage.goto('/vendor');
  await expect(vendorPage).toHaveURL(/\/vendor\/orders$/);
  await expect(table(vendorPage).getByText('JZ-261110-0482')).toBeVisible();
  await page.goto('/admin/orders');
  await expect(table(page).getByText('JZ-261110-0482')).toBeVisible();

  const mine = await place(context, { customer: 'طلب مباشر للفلاح' });
  const theirs = await place(context, { vendor: 'Riyadh Carcasses', customer: 'طلب مباشر للرياض' });
  const row = table(page).getByRole('row').filter({ hasText: mine.number });
  await expect(row).toBeVisible();
  await expect(row).toHaveClass(/row-new/);
  await expect(table(page).getByText('طلب مباشر للرياض')).toBeVisible();
  await expect(table(vendorPage).getByText(mine.number)).toBeVisible();
  await expect(table(vendorPage).getByText(theirs.number)).toHaveCount(0);
});

test('a refused live stream falls back to polling, then reopens the stream', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  // The first stream answers 401 (an expired access cookie on reconnect): the browser closes it for good.
  let refused = 0;
  await page.route('**/api/admin/orders/events', (r) => (refused++ === 0 ? r.fulfill({ status: 401, body: '{"code":"UNAUTHORIZED"}' }) : r.fallback()));
  let streams = 0;
  const reopened = page.waitForRequest((r) => r.url().endsWith('/api/admin/orders/events') && ++streams === 2);
  await page.goto('/admin/orders');
  await reopened; // after the first poll succeeds
  const o = await place(context, { customer: 'بعد إعادة الاتصال' });
  await expect(table(page).getByText(o.number)).toBeVisible();
});

test('while polling, a status changed elsewhere updates the row', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  // The stream is always refused, so the board keeps polling (every 15 s, on a fake clock).
  await page.route('**/api/admin/orders/events', (r) => r.fulfill({ status: 401, body: '{"code":"UNAUTHORIZED"}' }));
  await page.clock.install();
  const o = await place(context);
  await page.goto('/admin/orders');
  const row = table(page).getByRole('row').filter({ hasText: o.number });
  await expect(row.getByText('جديد')).toBeVisible();
  await page.clock.runFor(16_000); // the polling feed has read the page once
  const moved = await page.evaluate(async (u) => (await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"to":"preparing"}' })).status, `/api/admin/orders/${o.id}/transition`);
  expect(moved).toBe(200);
  await page.clock.runFor(16_000);
  await expect(row.getByText('قيد التجهيز')).toBeVisible();
  await expect(row).not.toHaveClass(/row-new/);
});

test('the mock order route wants our own origin and a session', async ({ playwright }) => {
  const base = `http://localhost:${process.env.PORT ?? 3001}`;
  const api = await playwright.request.newContext({ baseURL: base });
  expect((await api.post('/api/mock-orders', { data: {} })).status()).toBe(403); // no Origin
  expect((await api.post('/api/mock-orders', { data: {}, headers: { origin: base } })).status()).toBe(401); // same origin, no session
  await api.dispose();
});

test('the vendor opens an order and moves it to the next status', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  const o = await place(context);
  await page.goto('/vendor/orders');
  await page.getByRole('link', { name: `فتح الطلب ${o.number}` }).click();
  await expect(page.getByRole('heading', { level: 1, name: `الطلب ${o.number}` })).toBeVisible();
  await expect(page.getByText('ريب آي بقري طازج 500 جم')).toBeVisible();
  await expect(page.getByText('500 جم · تقطيع: ستيك · تغليف: كيس فاكيوم · بدون: الدهن')).toBeVisible();
  await expect(page.getByText('موقع التسليم')).toBeVisible();
  // Vendors have no cancel, refund or reschedule.
  await expect(page.getByRole('button', { name: 'إلغاء واسترجاع' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'إعادة جدولة' })).toHaveCount(0);

  const actions = page.getByRole('group', { name: 'تحديث حالة الطلب' });
  await actions.getByRole('button', { name: 'بدء التجهيز' }).click();
  await toast(page, 'تم تحديث حالة الطلب إلى «قيد التجهيز»');
  await expect(page.locator('[aria-current=step]')).toContainText('جارٍ التجهيز');
  await actions.getByRole('button', { name: 'جاهز' }).click();
  await toast(page, 'تم تحديث حالة الطلب إلى «جاهز»');
  // A delivery order now waits for the driver: no vendor move left.
  await expect(actions).toHaveCount(0);
});

test('an admin confirms a cash-on-delivery order from the review', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  const o = await place(context, { method: 'cod' });
  await page.goto(`/admin/orders/${o.id}`);
  await expect(page.getByText('دفع عند الاستلام: راجع الطلب قبل إرساله للمتجر.')).toBeVisible();
  await page.getByRole('button', { name: 'تأكيد الطلب' }).click();
  await toast(page, `تم تأكيد الطلب ${o.number}`);
  await expect(page.getByText('دفع عند الاستلام: راجع الطلب قبل إرساله للمتجر.')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'تحديث حالة الطلب' }).getByRole('button', { name: 'بدء التجهيز' })).toBeVisible();
});

test('an admin rejects a cash-on-delivery order with a plain move to cancelled', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  const o = await place(context, { method: 'cod' });
  await page.goto(`/admin/orders/${o.id}`);
  await page.getByRole('button', { name: 'رفض الطلب' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('سبب الإلغاء').fill('العنوان خارج التغطية');
  const sent = page.waitForRequest((r) => r.method() === 'POST' && r.url().endsWith(`/api/admin/orders/${o.id}/transition`));
  await dialog.getByRole('button', { name: 'رفض الطلب' }).click();
  expect((await sent).postDataJSON()).toEqual({ to: 'cancelled', note: 'العنوان خارج التغطية' });
  await toast(page, `أُلغي الطلب ${o.number}`);
  await expect(page.locator('[aria-current=step]')).toContainText('ملغي');
});

test('an admin cancels a paid order and refunds it to the wallet', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  const o = await place(context);
  await page.goto(`/admin/orders/${o.id}`);
  await page.getByRole('button', { name: 'إلغاء واسترجاع' }).first().click();
  const dialog = page.getByRole('dialog', { name: `إلغاء الطلب ${o.number}؟` });
  await expect(dialog.getByText('سيُسترجع مبلغ 193.00 ر.س إلى بطاقة مدى ••4821 خلال 3 إلى 5 أيام عمل.')).toBeVisible();
  await dialog.getByRole('button', { name: 'محفظة العميل' }).click();
  await expect(dialog.getByText('سيُضاف مبلغ 193.00 ر.س إلى محفظة العميل فورًا.')).toBeVisible();
  await dialog.getByRole('button', { name: 'تأكيد الإلغاء' }).click();
  await expect(dialog.getByText('اكتب سبب الإلغاء')).toBeVisible();
  await dialog.getByLabel('سبب الإلغاء').fill('نفاد المنتج');
  await dialog.getByRole('button', { name: 'تأكيد الإلغاء' }).click();
  await toast(page, `أُلغي الطلب ${o.number}`);
  await expect(page.getByText('193.00 ر.س · تم')).toBeVisible();
  await expect(page.getByText('نفاد المنتج')).toBeVisible();
  await expect(page.getByRole('button', { name: 'إلغاء واسترجاع' }).first()).toBeDisabled();
  await expect(page.locator('[aria-current=step]')).toContainText('ملغي');
});

test('an admin reschedules to an available day only', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  const o = await place(context);
  await page.goto(`/admin/orders/${o.id}`);
  await page.getByRole('button', { name: 'إعادة جدولة' }).click();
  const dialog = page.getByRole('dialog', { name: 'إعادة جدولة التوصيل' });
  const day = dialog.getByLabel('اليوم الجديد');
  await expect(day.locator('option', { hasText: 'فات وقت الطلب' })).toBeDisabled();
  await expect(day.locator('option', { hasText: 'الموعد الحالي' })).toBeDisabled();
  const chosen = await day.locator('option:not([disabled])').last().textContent();
  await day.selectOption({ label: chosen! });
  // The window is the operations setting (another spec may have changed it).
  await expect(dialog.getByText(new RegExp(`سيصل إشعار للعميل بالموعد الجديد: ${chosen}، من \\d+:00 م إلى \\d+:00 م\\.`))).toBeVisible();
  await dialog.getByRole('button', { name: 'حفظ الموعد' }).click();
  await toast(page, 'تم حفظ الموعد الجديد');
  await expect(page.getByText(new RegExp(`^${chosen}، من`))).toBeVisible();
});

test('the order label previews, and prints alone', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/orders');
  await page.getByRole('link', { name: 'فتح الطلب JZ-261110-0482' }).click();
  await page.getByRole('button', { name: 'طباعة الملصق', exact: true }).click();
  const label = page.getByRole('region', { name: 'ملصق الطلب A6 (معاينة)' });
  await expect(label.getByText('سعد العتيبي')).toBeVisible();
  await expect(label.getByText('2.25 كجم')).toBeVisible();
  await expect(label.getByRole('img', { name: 'باركود رقم الطلب JZ-261110-0482' })).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('heading', { level: 1 })).toBeHidden();
  await expect(label.getByText('سعد العتيبي')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'رجوع للتفاصيل' }).click();
  await expect(page.getByText('الدفع والتوصيل')).toBeVisible();
});

test("a vendor cannot open another store's order", async ({ page, context }) => {
  await signInAs(context, ['admin', 'vendor']);
  const other = await find(page, 'JZ-261110-0481');
  expect(await page.evaluate(async (u) => (await fetch(u)).status, `/api/vendor/orders/${other.id}`)).toBe(404);
  await page.goto(`/vendor/orders/${other.id}`);
  await expect(page.getByText('الطلب غير موجود')).toBeVisible();
  await page.goto('/vendor/orders');
  await expect(table(page).getByText('نورة القحطاني')).toHaveCount(0);
});

test('an admin without the permission sees the not-allowed states', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  const o = await find(page, 'JZ-261110-0482');
  await context.addCookies([{ url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/orders');
  await expect(page.getByText('ليست لديك صلاحية')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.goto(`/admin/orders/${o.id}`);
  await expect(page.getByText('ليست لديك صلاحية')).toBeVisible();
});

test('English mirrors the board', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/en/admin/orders');
  await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Orders' }).getByText('Al Falah Butchery').first()).toBeVisible();
});
