import type { Page } from '@playwright/test';
import { clientSettings, coupon, COUPON_ID, vendor } from './fixtures';
import { error, expect, notImplemented, signInAs, test } from './stub';

// CRT-DSH-1 (#63) on the real build: GET/POST /v1/admin/coupons, GET/PATCH …/{id}, GET …/{id}/usage.

const table = (page: Page) => page.getByRole('table', { name: 'الكوبونات' });
const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const riyadh = (days: number) => new Date(Date.now() + days * 86_400_000 + 3 * 3_600_000).toISOString().slice(0, 10);

test.beforeEach(async ({ context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/public/settings/client', 200, clientSettings());
  api.on('get', '/v1/admin/vendors', 200, { items: [vendor()], nextCursor: null });
  api.on('get', '/v1/admin/lists/{list}', 200, { items: [], nextCursor: null });
});

test('the list reads status and usage, and filters with the contract query', async ({ page, api }) => {
  api.on('get', '/v1/admin/coupons', 200, { items: [coupon(), coupon({ id: '20202020-9999-4999-8999-000000000002', code: 'OLD10', status: 'expired', usageLimit: null, usageCount: 7 })], nextCursor: null });
  await page.goto('/admin/marketing/coupons');
  const row = table(page).getByRole('row').filter({ hasText: 'RAMADAN25' });
  await expect(row).toContainText('نسبة مئوية · 25%');
  await expect(row).toContainText('فعّال');
  await expect(row).toContainText('132 / 500');
  await expect(table(page).getByRole('row').filter({ hasText: 'OLD10' })).toContainText('منتهي');

  await page.getByLabel('حالة الكوبون').selectOption('expired');
  await page.getByRole('searchbox', { name: 'ابحث برمز الكوبون' }).fill('old');
  await expect.poll(() => api.callsTo('get', '/v1/admin/coupons').at(-1)?.query.toString()).toBe('status=expired&q=old');
});

test('create sends CreateCouponDto; COUPON_CODE_TAKEN lands on the code', async ({ page, api }) => {
  api.on('post', '/v1/admin/coupons', 409, error('COUPON_CODE_TAKEN'));
  await page.goto('/admin/marketing/coupons/new');
  await page.getByLabel('رمز الكوبون').fill('eid10');
  await page.getByLabel('نوع الخصم').selectOption('fixed');
  await page.getByLabel('قيمة الخصم (ر.س)').fill('30');
  await page.getByLabel('يبدأ في').fill(`${riyadh(2)}T10:00`);
  await page.getByLabel('ينتهي في').fill(`${riyadh(30)}T23:59`);
  await page.getByLabel('الحد الأدنى للطلب (ر.س)').fill('150');
  await page.getByRole('button', { name: 'مجازر الفلاح' }).click();
  await page.getByRole('button', { name: 'إنشاء الكوبون' }).click();
  await expect(page.getByText('هذا الرمز مستخدم لكوبون آخر')).toBeVisible();
  expect(api.callsTo('post', '/v1/admin/coupons')[0]!.body).toEqual({
    code: 'EID10', type: 'fixed', value: 3000, maxDiscountHalalas: null, minOrderHalalas: 15000, vendorIds: [vendor().id], categoryIds: [],
    startsAt: new Date(`${riyadh(2)}T10:00:00+03:00`).toISOString(), endsAt: new Date(`${riyadh(30)}T23:59:00+03:00`).toISOString(),
    usageLimit: null, perUserLimit: 1, isActive: true,
  });

  api.on('post', '/v1/admin/coupons', 201, (c) => coupon({ ...(c.body as object), id: COUPON_ID, status: 'scheduled', usageCount: 0 }));
  api.on('get', '/v1/admin/coupons/{id}', 200, coupon({ code: 'EID10', type: 'fixed', value: 3000 }));
  api.on('get', '/v1/admin/coupons/{id}/usage', 200, { uses: 0, distinctCustomers: 0, totalDiscountHalalas: 0 });
  await page.getByLabel('رمز الكوبون').fill('eid11');
  await page.getByRole('button', { name: 'إنشاء الكوبون' }).click();
  await toast(page, 'تم إنشاء الكوبون EID11');
});

test('edit sends only a PATCH; usage reads distinctCustomers; deactivate sends isActive alone', async ({ page, api }) => {
  api.on('get', '/v1/admin/coupons/{id}', 200, coupon());
  api.on('get', '/v1/admin/coupons/{id}/usage', 200, { uses: 132, distinctCustomers: 120, totalDiscountHalalas: 528000 });
  api.on('patch', '/v1/admin/coupons/{id}', 200, (c) => coupon(c.body as object));
  await page.goto(`/admin/marketing/coupons/${COUPON_ID}`);
  const usage = page.locator('section').filter({ has: page.getByRole('heading', { name: 'الاستخدام' }) });
  await expect(usage).toContainText('132 / 500');
  await expect(usage).toContainText('120');
  await expect(usage).toContainText('5,280.00 ر.س');

  await page.getByLabel('نسبة الخصم (%)').fill('30');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await toast(page, 'تم حفظ الكوبون RAMADAN25');
  const edit = api.callsTo('patch', `/v1/admin/coupons/${COUPON_ID}`)[0]!.body as Record<string, unknown>;
  expect(edit.value).toBe(30);
  expect(edit).not.toHaveProperty('startsAt'); // dates not touched are left out
  expect(edit).not.toHaveProperty('firstOrderOnly');

  await page.getByRole('button', { name: 'إيقاف الكوبون' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'إيقاف' }).click();
  await toast(page, 'تم إيقاف الكوبون RAMADAN25');
  expect(api.callsTo('patch', `/v1/admin/coupons/${COUPON_ID}`)[1]!.body).toEqual({ isActive: false });
});

for (const [locale, title] of [['ar', 'قريبًا'], ['en', 'Coming soon']] as const) {
  test(`501 NOT_IMPLEMENTED shows coming soon on the list and the form (${locale})`, async ({ page, api }) => {
    api.on('get', '/v1/admin/coupons', 501, notImplemented('CRT-API-3'));
    api.on('get', '/v1/admin/coupons/{id}', 501, notImplemented('CRT-API-3'));
    api.on('get', '/v1/admin/coupons/{id}/usage', 501, notImplemented('CRT-API-3'));
    const prefix = locale === 'en' ? '/en' : '';
    await page.goto(`${prefix}/admin/marketing/coupons`);
    await expect(page.getByRole('status').filter({ hasText: title })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.goto(`${prefix}/admin/marketing/coupons/${COUPON_ID}`);
    await expect(page.getByRole('status').filter({ hasText: title })).toBeVisible();
  });
}

test('PERMISSION_DENIED shows not allowed', async ({ page, api }) => {
  api.on('get', '/v1/admin/coupons', 403, error('PERMISSION_DENIED'));
  await page.goto('/admin/marketing/coupons');
  await expect(page.getByText('ليست لديك صلاحية لإدارة الكوبونات')).toBeVisible();
});
