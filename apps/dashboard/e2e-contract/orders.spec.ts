import type { Page } from '@playwright/test';
import { clientSettings, order, ORDER_ID, riyadh, summary, vendor } from './fixtures';
import { error, expect, notImplemented, signInAs, test } from './stub';

// ORD-DSH-1 (#88) on the real build: GET /v1/{admin,vendor}/orders(/{id}), POST …/{id}/transition, and the board's
// polling (the contract has no dashboard realtime yet: orders.md).

const table = (page: Page) => page.getByRole('table', { name: 'الطلبات' });
const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const page1 = (...items: ReturnType<typeof summary>[]) => ({ items, nextCursor: null });

test.beforeEach(async ({ api }) => {
  api.on('get', '/v1/public/settings/client', 200, clientSettings());
  api.on('get', '/v1/admin/review-queue', 200, { items: [], nextCursor: null, count: 0 }); // the side nav badge
  api.on('get', '/v1/admin/vendors', 200, { items: [vendor()], nextCursor: null });
});

test('the admin board reads the list with the contract query, and filters', async ({ page, context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/admin/orders', 200, page1(summary(), summary({ id: '0a0a0a0a-2222-4222-8222-000000000002', number: 'JZ-261123-0002', status: 'preparing', paymentMethod: 'mada', customer: { id: '0b0b0b0b-3333-4333-8333-000000000002', name: null, phone: '+966500000000' } })));
  await page.goto('/admin/orders');
  const row = table(page).getByRole('row').filter({ hasText: 'JZ-261123-0001' });
  await expect(row).toContainText('سعد العتيبي');
  await expect(row).toContainText('مجازر الفلاح');
  await expect(row).toContainText('بانتظار التأكيد');
  await expect(row).toContainText('193.00');
  await expect(table(page).getByRole('row').filter({ hasText: 'JZ-261123-0002' })).toContainText('—'); // no customer name

  await page.getByLabel('الحالة', { exact: true }).selectOption('new');
  await page.getByLabel('طريقة الدفع').selectOption('cod');
  await page.getByLabel('المتجر', { exact: true }).selectOption({ label: 'مجازر الفلاح' });
  await page.getByLabel('التاريخ', { exact: true }).fill(riyadh(1));
  await expect.poll(() => api.callsTo('get', '/v1/admin/orders').at(-1)?.query.toString()).toBe(
    new URLSearchParams({ status: 'new', paymentMethod: 'cod', vendorId: vendor().id, fulfilmentDate: riyadh(1) }).toString(),
  );
});

test('a new order appears without a refresh (polling), tinted', async ({ page, context, api }) => {
  await signInAs(context, ['vendor']);
  api.on('get', '/v1/vendor/orders', 200, page1(summary()));
  await page.clock.install();
  await page.goto('/vendor/orders');
  await expect(table(page).getByText('JZ-261123-0001')).toBeVisible();
  // The feed starts after the first load and reads the page once as its baseline.
  await expect.poll(() => api.callsTo('get', '/v1/vendor/orders').length).toBe(2);
  const fresh = summary({ id: '0a0a0a0a-2222-4222-8222-000000000009', number: 'JZ-261123-0009', createdAt: new Date().toISOString() });
  api.on('get', '/v1/vendor/orders', 200, page1(fresh, summary()));
  await page.clock.runFor(16_000);
  const row = table(page).getByRole('row').filter({ hasText: 'JZ-261123-0009' });
  await expect(row).toBeVisible();
  await expect(row).toHaveClass(/row-new/);
});

test('the vendor moves an order with its allowedTransitions; a refused move reloads the order', async ({ page, context, api }) => {
  await signInAs(context, ['vendor']);
  const confirmed = order({ status: 'confirmed', paymentMethod: 'mada', allowedTransitions: ['preparing'] });
  api.on('get', '/v1/vendor/orders/{id}', 200, confirmed);
  api.on('post', '/v1/vendor/orders/{id}/transition', 200, order({ status: 'preparing', allowedTransitions: ['ready'] }));
  await page.goto(`/vendor/orders/${ORDER_ID}`);
  await expect(page.getByRole('heading', { level: 1, name: 'الطلب JZ-261123-0001' })).toBeVisible();
  // The line's options from the contract: size weight, cutting, packaging enum, exclusions.
  await expect(page.getByText('500 جم · تقطيع: ستيك · تغليف: كيس مفرّغ · بدون: الدهن')).toBeVisible();
  await expect(page.getByText('حي الملقا، شارع أنس بن مالك، 12، الرياض')).toBeVisible();
  await expect(page.getByText('ملاحظة العنوان: البوابة الثانية')).toBeVisible();

  const actions = page.getByRole('group', { name: 'تحديث حالة الطلب' });
  await expect(actions.getByRole('button')).toHaveCount(1); // only what allowedTransitions offers
  await actions.getByRole('button', { name: 'بدء التجهيز' }).click();
  await toast(page, 'تم تحديث حالة الطلب إلى «قيد التجهيز»');
  expect(api.callsTo('post', `/v1/vendor/orders/${ORDER_ID}/transition`)[0]!.body).toEqual({ to: 'preparing' });
  await expect(actions.getByRole('button', { name: 'جاهز' })).toBeVisible();

  // Moved elsewhere meanwhile: ORDER_TRANSITION_NOT_ALLOWED, and the order is read again.
  api.on('post', '/v1/vendor/orders/{id}/transition', 409, error('ORDER_TRANSITION_NOT_ALLOWED', { from: 'preparing', to: 'ready' }));
  api.on('get', '/v1/vendor/orders/{id}', 200, order({ status: 'cancelled', allowedTransitions: [], cancelReason: 'طلب العميل الإلغاء' }));
  const reads = api.callsTo('get', `/v1/vendor/orders/${ORDER_ID}`).length;
  await actions.getByRole('button', { name: 'جاهز' }).click();
  await toast(page, 'تغيّرت حالة الطلب');
  await expect.poll(() => api.callsTo('get', `/v1/vendor/orders/${ORDER_ID}`).length).toBe(reads + 1);
  await expect(actions).toHaveCount(0);
  await expect(page.getByText('طلب العميل الإلغاء')).toBeVisible();
});

test('an admin confirms or rejects a cash-on-delivery order', async ({ page, context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/admin/orders/{id}', 200, order());
  api.on('post', '/v1/admin/orders/{id}/transition', 200, (c) =>
    c.body.to === 'confirmed'
      ? order({ status: 'confirmed', allowedTransitions: ['preparing', 'cancelled'] })
      : order({ status: 'cancelled', allowedTransitions: [], cancelReason: c.body.note ?? null }),
  );
  await page.goto(`/admin/orders/${ORDER_ID}`);
  await expect(page.getByText('دفع عند الاستلام: راجع الطلب قبل إرساله للمتجر.')).toBeVisible();
  // Sprint 4 actions (not in the contract) are disabled on the API.
  await expect(page.getByRole('button', { name: 'إعادة جدولة' })).toBeDisabled();

  await page.getByRole('button', { name: 'رفض الطلب' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('سبب الإلغاء').fill('العنوان خارج التغطية');
  await dialog.getByRole('button', { name: 'رفض الطلب' }).click();
  await toast(page, 'أُلغي الطلب JZ-261123-0001');
  expect(api.callsTo('post', `/v1/admin/orders/${ORDER_ID}/transition`)[0]!.body).toEqual({ to: 'cancelled', note: 'العنوان خارج التغطية' });
  await expect(page.getByText('العنوان خارج التغطية')).toBeVisible();

  await page.reload(); // the stub still answers the order as new
  await page.getByRole('button', { name: 'تأكيد الطلب' }).click();
  await toast(page, 'تم تأكيد الطلب JZ-261123-0001');
  expect(api.callsTo('post', `/v1/admin/orders/${ORDER_ID}/transition`)[1]!.body).toEqual({ to: 'confirmed' });
});

test('the COD review offers only what allowedTransitions holds', async ({ page, context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/admin/orders/{id}', 200, order({ allowedTransitions: [] }));
  await page.goto(`/admin/orders/${ORDER_ID}`);
  await expect(page.getByRole('heading', { level: 1, name: 'الطلب JZ-261123-0001' })).toBeVisible();
  await expect(page.getByText('دفع عند الاستلام: راجع الطلب قبل إرساله للمتجر.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'تأكيد الطلب' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'رفض الطلب' })).toHaveCount(0);

  api.on('get', '/v1/admin/orders/{id}', 200, order({ allowedTransitions: ['cancelled'] }));
  await page.reload();
  await expect(page.getByRole('button', { name: 'رفض الطلب' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'تأكيد الطلب' })).toHaveCount(0);
});

test('a transition answered 501 says coming soon and keeps the order', async ({ page, context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/admin/orders/{id}', 200, order());
  api.on('post', '/v1/admin/orders/{id}/transition', 501, notImplemented('ORD-API-2'));
  await page.goto(`/admin/orders/${ORDER_ID}`);
  await page.getByRole('button', { name: 'تأكيد الطلب' }).click();
  await toast(page, 'هذا الإجراء غير متاح بعد، سيعمل قريبًا.');
  await expect(page.getByText('دفع عند الاستلام: راجع الطلب قبل إرساله للمتجر.')).toBeVisible();
});

test('PERMISSION_DENIED and NOT_FOUND', async ({ page, context, api }) => {
  await signInAs(context, ['vendor']);
  api.on('get', '/v1/vendor/orders', 403, error('PERMISSION_DENIED'));
  api.on('get', '/v1/vendor/orders/{id}', 404, error('NOT_FOUND'));
  await page.goto('/vendor/orders');
  await expect(page.getByRole('status').filter({ hasText: 'ليست لديك صلاحية' })).toBeVisible();
  await page.goto(`/vendor/orders/${ORDER_ID}`);
  await expect(page.getByText('الطلب غير موجود')).toBeVisible();
});
