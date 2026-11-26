import { capacity, clientSettings, riyadh, settings, vendor, VENDOR_ID } from './fixtures';
import { error, expect, notImplemented, signInAs, test, TOKEN } from './stub';

// SCH-DSH-1 (#70) on the real build: GET/PATCH /v1/admin/settings/operations, PUT …/pause, the pause read from
// GET /v1/public/settings/client, and the vendor capacity routes.

const toast = (page: import('@playwright/test').Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const headerSwitch = (page: import('@playwright/test').Page) => page.getByRole('banner').getByRole('switch', { name: 'إيقاف كل الطلبات' });

test.beforeEach(async ({ context, api }) => {
  await signInAs(context, ['admin']);
  api.on('get', '/v1/public/settings/client', 200, clientSettings());
  api.on('get', '/v1/admin/review-queue', 200, { items: [], nextCursor: null, count: 0 }); // the side nav badge
});

test('every section saves with the contract keys, and the API field errors land on their fields', async ({ page, api }) => {
  api.on('get', '/v1/admin/settings/operations', 200, settings());
  api.on('patch', '/v1/admin/settings/operations', 200, (c) => settings(c.body));
  await page.goto('/admin/settings/operations');
  await expect(page.getByLabel('الحد الأقصى للطلبات يوميًا')).toHaveValue('40');
  await expect(page.getByLabel('آخر وقت للطلب: لحوم جاهزة')).toHaveValue('12:00');
  await expect(page.getByLabel('آخر وقت للطلب: مناسبة')).toHaveValue(''); // null: no cutoff time
  expect(api.callsTo('get', '/v1/admin/settings/operations')[0]!.auth).toBe(`Bearer ${TOKEN.admin}`);

  await page.getByLabel('الحد الأقصى للطلبات يوميًا').fill('55');
  await page.getByLabel('آخر وقت للطلب: لحوم جاهزة').fill('13:30');
  await page.getByLabel('رسوم التوصيل (ر.س)').fill('20.5');
  await page.getByRole('checkbox', { name: 'طبخ' }).click();
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await toast(page, 'تم حفظ الإعدادات التشغيلية');
  const sent = api.callsTo('patch', '/v1/admin/settings/operations')[0]!.body as Record<string, unknown>;
  // UpdateOperationsSettingsDto: no pause, no updatedAt; adha and the unshown order types kept as read.
  expect(Object.keys(sent).sort()).toEqual(['bookingHorizonDays', 'closedDays', 'cod', 'complaintWindowHours', 'cutoffs', 'defaultCapacity', 'deliveryFeeHalalas', 'deliveryWindow', 'minOrderHalalas']);
  expect(sent).toMatchObject({
    defaultCapacity: { ordersPerDay: 55, carcassesPerDay: 10 },
    cutoffs: { readyMeat: { time: '13:30', leadDays: 0 }, occasion: { time: null, leadDays: 3 }, adha: { time: null, leadDays: 3 } },
    deliveryFeeHalalas: 2050,
    cod: { allowedOrderTypes: ['ready_meat', 'adha', 'cooked'] },
  });

  // VALIDATION_FAILED from the API, on the contract's paths.
  api.on('patch', '/v1/admin/settings/operations', 400, error('VALIDATION_FAILED', [
    { field: 'defaultCapacity.carcassesPerDay', constraints: ['min'] },
    { field: 'closedDays.0.date', constraints: ['notPast'] },
  ]));
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await toast(page, 'راجع الحقول المظللة بالأحمر.');
  await expect(page.getByLabel('الحد الأقصى للذبائح يوميًا')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('لا يمكن اختيار يوم مضى')).toBeVisible();
});

test('the pause: read from the client settings on every admin page, set on its own route', async ({ page, api }) => {
  api.on('get', '/v1/admin/settings/operations', 200, settings());
  api.on('put', '/v1/admin/settings/operations/pause', 200, (c) => {
    const p = c.body;
    const paused = p.isPaused ? { isPaused: true, messageAr: p.messageAr!, messageEn: p.messageEn! } : { isPaused: false, messageAr: null, messageEn: null };
    api.on('get', '/v1/public/settings/client', 200, clientSettings(paused));
    return settings({ paused });
  });
  api.on('get', '/v1/admin/lists/{list}', 200, { items: [], nextCursor: null });
  api.on('get', '/v1/admin/vendors', 200, { items: [vendor()], nextCursor: null });
  await page.goto('/admin/catalog/categories');
  await headerSwitch(page).click();
  const dialog = page.getByRole('dialog', { name: 'إيقاف استقبال الطلبات؟' });
  await dialog.getByLabel('الرسالة التي تظهر للعملاء').fill('متوقفون للجرد');
  await dialog.getByLabel('الرسالة بالإنجليزية').fill('Closed for stock count');
  await dialog.getByRole('button', { name: 'إيقاف الآن' }).click();
  await toast(page, 'تم إيقاف استقبال الطلبات');
  expect(api.callsTo('put', '/v1/admin/settings/operations/pause')[0]!.body).toEqual({ isPaused: true, messageAr: 'متوقفون للجرد', messageEn: 'Closed for stock count' });

  // Another admin page, loaded fresh: the public read carries the pause.
  await page.goto('/admin/vendors');
  await expect(headerSwitch(page)).toBeChecked();
  await expect(page.getByRole('status').filter({ hasText: 'متوقفون للجرد' })).toBeVisible();

  await headerSwitch(page).click();
  await page.getByRole('dialog', { name: 'استئناف استقبال الطلبات؟' }).getByRole('button', { name: 'استئناف الآن' }).click();
  await toast(page, 'تم استئناف استقبال الطلبات');
  expect(api.callsTo('put', '/v1/admin/settings/operations/pause')[1]!.body).toEqual({ isPaused: false });
  await expect(headerSwitch(page)).not.toBeChecked();
});

// SCH-API-1 is live (#325): its routes no longer answer 501, so the «coming soon» state is proven on
// the capacity routes below, which are still stubs.

test('PERMISSION_DENIED shows not allowed and keeps the session', async ({ page, api }) => {
  api.on('get', '/v1/admin/settings/operations', 403, error('PERMISSION_DENIED'));
  await page.goto('/admin/settings/operations');
  await expect(page.getByText('ليست لديك صلاحية تعديل الإعدادات التشغيلية')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/settings\/operations$/);
});

test('per-vendor capacity: the default and one day on the contract routes; 501 shows coming soon', async ({ page, api }) => {
  api.on('get', '/v1/admin/vendors/{id}', 200, vendor());
  api.on('get', '/v1/admin/settings/operations', 200, settings());
  api.on('get', '/v1/admin/vendors/{id}/capacity', 200, capacity());
  api.on('put', '/v1/admin/vendors/{id}/capacity', 200, (c) => capacity(c.body));
  const day = riyadh(5);
  api.on('put', '/v1/admin/vendors/{id}/capacity/{date}', 200, (c) =>
    capacity({
      ordersPerDay: 30,
      // Every day of the horizon comes back; only the one with its own limits is a «specific date».
      days: [
        { date: riyadh(4), ordersLimit: null, carcassesLimit: null, ordersBooked: 5, carcassesBooked: 1 },
        { date: day, ...c.body, ordersBooked: 2, carcassesBooked: 0 },
      ],
    }),
  );
  api.on('delete', '/v1/admin/vendors/{id}/capacity/{date}', 200, capacity({ ordersPerDay: 30 }));
  await page.goto(`/admin/vendors/${VENDOR_ID}`);
  await page.getByRole('tab', { name: 'السعة' }).click();
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByText('اتركه فارغًا لاستخدام سعة المنصة (40)').first()).toBeVisible(); // defaultCapacity of the settings

  await panel.getByLabel('الحد الأقصى للطلبات يوميًا').fill('30');
  await panel.getByRole('button', { name: 'حفظ السعة' }).click();
  await toast(page, 'تم حفظ السعة الافتراضية للمتجر');
  expect(api.callsTo('put', `/v1/admin/vendors/${VENDOR_ID}/capacity`)[0]!.body).toEqual({ ordersPerDay: 30, carcassesPerDay: null });

  await panel.getByRole('button', { name: 'إضافة تاريخ' }).click();
  const dialog = page.getByRole('dialog', { name: 'سعة تاريخ محدد' });
  await dialog.getByLabel('التاريخ').fill(day);
  await dialog.getByLabel('حد الذبائح').fill('3');
  await dialog.getByRole('button', { name: 'حفظ' }).click();
  await toast(page, 'تم حفظ سعة التاريخ');
  expect(api.callsTo('put', `/v1/admin/vendors/${VENDOR_ID}/capacity/${day}`)[0]!.body).toEqual({ ordersLimit: null, carcassesLimit: 3 });
  await expect(panel.getByRole('table', { name: 'تواريخ محددة' }).getByText('3', { exact: true })).toBeVisible();
  await expect(panel.getByRole('table', { name: 'تواريخ محددة' }).getByRole('row')).toHaveCount(2); // header + that day
  await panel.getByRole('button', { name: /^إزالة / }).click();
  await toast(page, 'تمت إزالة التاريخ');
  expect(api.callsTo('delete', `/v1/admin/vendors/${VENDOR_ID}/capacity/${day}`)).toHaveLength(1);

  api.on('get', '/v1/admin/vendors/{id}/capacity', 501, notImplemented('SCH-API-2'));
  await page.reload();
  await page.getByRole('tab', { name: 'السعة' }).click();
  await expect(page.getByRole('tabpanel').getByRole('status').filter({ hasText: 'قريبًا' })).toBeVisible();
});
