import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/operations/backend.mock.ts): settings seeded from 118:11181; closed days on the coming Friday and
// two days from today. One server and one mock store for the whole run: each test leaves ordering open again.

const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const save = (page: Page) => page.getByRole('button', { name: 'حفظ التغييرات' }).click();
const riyadh = (days = 0) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date(Date.now() + days * 86_400_000));

async function open(page: Page) {
  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/admin\/settings\/operations$/);
  await expect(page.getByRole('heading', { level: 1, name: 'الإعدادات التشغيلية' })).toBeVisible();
}

test('every section edits, saves and reloads', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await open(page);
  await expect(page.getByRole('tab', { name: 'التشغيل' })).toHaveAttribute('aria-selected', 'true');

  // Working hours: Friday opens with its own hours.
  await page.getByRole('switch', { name: 'الجمعة · مغلق' }).click();
  await page.getByLabel('الجمعة: من').selectOption('14:00');
  // Capacity, cutoffs and lead days.
  await page.getByLabel('الحد الأقصى للطلبات يوميًا').fill('150');
  await page.getByLabel('آخر وقت للطلب: ذبيحة').fill('13:00');
  await page.getByLabel('أيام التجهيز المسبق: مناسبة').fill('4');
  // Delivery window and horizon; the preview follows.
  await page.getByLabel('بداية فترة التوصيل').fill('15:00');
  await page.getByLabel('نهاية فترة التوصيل').fill('19:00');
  await expect(page.getByText('يصل بين 3 و 7 مساءً')).toBeVisible();
  await page.getByLabel('عدد الأيام المتاحة للحجز').fill('10');
  // Fees, COD and complaints.
  await page.getByLabel('الحد الأدنى للطلب (ر.س)').fill('120');
  await page.getByLabel('رسوم التوصيل (ر.س)').fill('20.5');
  await page.getByLabel('أقصى مبلغ للطلب (ر.س)').fill('');
  await page.getByRole('checkbox', { name: 'طبخ' }).click();
  await page.getByLabel('تأكيد الطلب').selectOption('review');
  await page.getByLabel('مدة قبول الشكوى (ساعة)').fill('72');
  await page.getByLabel('الرسالة بالإنجليزية').fill('Back on Sunday');
  await save(page);
  await toast(page, 'تم حفظ الإعدادات التشغيلية');

  await page.reload();
  await expect(page.getByRole('switch', { name: 'الجمعة · مفتوح' })).toBeChecked();
  await expect(page.getByLabel('الجمعة: من')).toHaveValue('14:00');
  await expect(page.getByLabel('الحد الأقصى للطلبات يوميًا')).toHaveValue('150');
  await expect(page.getByLabel('آخر وقت للطلب: ذبيحة')).toHaveValue('13:00');
  await expect(page.getByLabel('أيام التجهيز المسبق: مناسبة')).toHaveValue('4');
  await expect(page.getByLabel('نهاية فترة التوصيل')).toHaveValue('19:00');
  await expect(page.getByLabel('عدد الأيام المتاحة للحجز')).toHaveValue('10');
  await expect(page.getByLabel('الحد الأدنى للطلب (ر.س)')).toHaveValue('120.00');
  await expect(page.getByLabel('رسوم التوصيل (ر.س)')).toHaveValue('20.50');
  await expect(page.getByLabel('أقصى مبلغ للطلب (ر.س)')).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'طبخ' })).toBeChecked();
  await expect(page.getByLabel('تأكيد الطلب')).toHaveValue('review');
  await expect(page.getByLabel('مدة قبول الشكوى (ساعة)')).toHaveValue('72');
  await expect(page.getByLabel('الرسالة بالإنجليزية')).toHaveValue('Back on Sunday');

  // The settings tabs reach the coverage zones.
  await page.getByRole('tab', { name: 'مناطق التغطية' }).click();
  await expect(page).toHaveURL(/\/admin\/settings\/coverage$/);
});

test('validation on the page and the API errors on their fields', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await open(page);
  // 118:12848: a zero limit and «25:00».
  await page.getByLabel('الحد الأقصى للطلبات يوميًا').fill('0');
  await page.getByLabel('آخر وقت للطلب: طبخ').fill('25:00');
  await page.getByLabel('نهاية فترة التوصيل').fill('10:00');
  await save(page);
  await expect(page.getByText('يجب أن يكون الحد أكبر من صفر')).toBeVisible();
  await expect(page.getByText('أدخل وقتًا صحيحًا بصيغة 24 ساعة')).toBeVisible();
  await expect(page.getByText('يجب أن تكون النهاية بعد البداية')).toBeVisible();
  await expect(page.getByLabel('الحد الأقصى للطلبات يوميًا')).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'إلغاء' }).click();
  await expect(page.getByText('يجب أن يكون الحد أكبر من صفر')).toHaveCount(0);

  // The API refuses a field the page let through: its VALIDATION_FAILED lands on that field.
  await page.route('**/api/admin/settings/operations', (route) =>
    route.request().method() === 'PUT'
      ? route.fulfill({ status: 400, json: { code: 'VALIDATION_FAILED', details: [{ field: 'deliveryFeeHalalas', constraints: ['max'] }, { field: 'cutoffs.carcass.leadDays', constraints: ['max'] }] } })
      : route.fallback(),
  );
  await save(page);
  await toast(page, 'راجع الحقول المظللة بالأحمر.');
  await expect(page.getByLabel('رسوم التوصيل (ر.س)')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('أدخل مبلغًا صحيحًا بالريال')).toBeVisible();
  await expect(page.getByText('أدخل عدد أيام من 0 إلى 30')).toBeVisible();
});

test('add and remove a closed day', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await open(page);
  // The seeds close the coming Friday and today + 2: tomorrow, unless that is the Friday.
  const date = new Date(`${riyadh(1)}T00:00:00Z`).getUTCDay() === 5 ? riyadh(3) : riyadh(1);

  await page.getByRole('button', { name: 'إضافة يوم مغلق' }).click();
  const dialog = page.getByRole('dialog', { name: 'إضافة يوم مغلق' });
  await dialog.getByLabel('التاريخ').fill(riyadh(-1));
  await dialog.getByRole('button', { name: 'إضافة' }).click();
  await expect(dialog.getByText('لا يمكن اختيار يوم مضى')).toBeVisible();
  await expect(dialog.getByText('اكتب السبب (100 حرف على الأكثر)')).toHaveCount(2);
  await dialog.getByLabel('التاريخ').fill(date);
  await dialog.getByLabel('ما يُغلق').selectOption('pickup');
  await dialog.getByLabel('السبب بالعربية').fill('صيانة الثلاجات');
  await dialog.getByLabel('السبب بالإنجليزية').fill('Fridge maintenance');
  await dialog.getByRole('button', { name: 'إضافة' }).click();
  await expect(dialog).toBeHidden();
  const row = page.getByRole('listitem').filter({ hasText: 'الاستلام فقط · صيانة الثلاجات' });
  await expect(row).toBeVisible();
  await save(page);
  await toast(page, 'تم حفظ الإعدادات التشغيلية');

  await page.reload();
  if (date.slice(0, 7) !== riyadh().slice(0, 7)) await page.getByRole('button', { name: 'الشهر التالي' }).click();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /^إزالة / }).click();
  await expect(row).toHaveCount(0);
  await save(page);
  await toast(page, 'تم حفظ الإعدادات التشغيلية');
  await page.reload();
  if (date.slice(0, 7) !== riyadh().slice(0, 7)) await page.getByRole('button', { name: 'الشهر التالي' }).click();
  await expect(row).toHaveCount(0);
});

test('pause from the header with a message: banner on every admin page, then resume', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/categories');
  const header = page.getByRole('banner');
  await header.getByRole('switch', { name: 'إيقاف استقبال الطلبات' }).click();
  const dialog = page.getByRole('dialog', { name: 'إيقاف استقبال الطلبات؟' });
  await dialog.getByLabel('الرسالة التي تظهر للعملاء').fill('');
  await dialog.getByRole('button', { name: 'إيقاف الآن' }).click();
  await expect(dialog.getByText('اكتب الرسالة (200 حرف على الأكثر)')).toBeVisible();
  await dialog.getByLabel('الرسالة التي تظهر للعملاء').fill('متوقفون للجرد حتى المساء');
  await dialog.getByLabel('الرسالة بالإنجليزية').fill('Closed for stock count until evening');
  await dialog.getByRole('button', { name: 'إيقاف الآن' }).click();
  await toast(page, 'تم إيقاف استقبال الطلبات');
  await expect(page.getByRole('alert').filter({ hasText: 'استقبال الطلبات متوقف. يرى العملاء: «متوقفون للجرد حتى المساء»' })).toBeVisible();

  // Another admin page, loaded fresh: the switch, its badge and the banner.
  await page.goto('/admin/vendors');
  await expect(header.getByRole('switch', { name: 'إيقاف استقبال الطلبات' })).toBeChecked();
  await expect(header.getByText('الطلبات متوقفة')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'متوقفون للجرد حتى المساء' })).toBeVisible();

  // The operations page shows the paused card (118:11833) and resumes from its own switch.
  await page.goto('/admin/settings/operations');
  const card = page.getByRole('region', { name: 'استقبال الطلبات' });
  await expect(card.getByRole('heading', { name: 'استقبال الطلبات متوقف الآن' })).toBeVisible();
  await expect(card.getByLabel('الرسالة التي تظهر للعملاء')).toHaveValue('متوقفون للجرد حتى المساء');
  await card.getByRole('switch', { name: 'إيقاف استقبال الطلبات' }).click();
  await page.getByRole('dialog', { name: 'استئناف استقبال الطلبات؟' }).getByRole('button', { name: 'استئناف الآن' }).click();
  await toast(page, 'تم استئناف استقبال الطلبات');
  await expect(card.getByRole('heading', { name: 'استقبال الطلبات', exact: true })).toBeVisible();
  await expect(header.getByRole('switch', { name: 'إيقاف استقبال الطلبات' })).not.toBeChecked();
  await expect(page.getByRole('alert').filter({ hasText: 'استقبال الطلبات متوقف' })).toHaveCount(0);

  // Pausing from the card (118:12270), then resuming from the header.
  await card.getByRole('switch', { name: 'إيقاف استقبال الطلبات' }).click();
  await page.getByRole('dialog', { name: 'إيقاف استقبال الطلبات؟' }).getByRole('button', { name: 'إيقاف الآن' }).click();
  await expect(header.getByText('الطلبات متوقفة')).toBeVisible();
  await header.getByRole('switch', { name: 'إيقاف استقبال الطلبات' }).click();
  await page.getByRole('dialog', { name: 'استئناف استقبال الطلبات؟' }).getByRole('button', { name: 'استئناف الآن' }).click();
  await expect(card.getByText('الطلبات مفتوحة')).toBeVisible();
});

test('per-vendor capacity: default override and a specific date', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await page.getByRole('table', { name: 'المتاجر' }).getByRole('link', { name: 'مجازر الفلاح', exact: true }).click();
  await page.getByRole('tab', { name: 'السعة' }).click();
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByText('اتركه فارغًا لاستخدام سعة المنصة')).toHaveCount(2);

  await panel.getByLabel('الحد الأقصى للطلبات يوميًا').fill('0');
  await panel.getByRole('button', { name: 'حفظ السعة' }).click();
  await expect(panel.getByText('يجب أن يكون الحد أكبر من صفر')).toBeVisible();
  await panel.getByLabel('الحد الأقصى للطلبات يوميًا').fill('30');
  await panel.getByRole('button', { name: 'حفظ السعة' }).click();
  await toast(page, 'تم حفظ السعة الافتراضية للمتجر');

  await panel.getByRole('button', { name: 'إضافة تاريخ' }).click();
  const dialog = page.getByRole('dialog', { name: 'سعة تاريخ محدد' });
  await dialog.getByLabel('التاريخ').fill(riyadh(5));
  await dialog.getByLabel('حد الذبائح').fill('3');
  await dialog.getByRole('button', { name: 'حفظ' }).click();
  await toast(page, 'تم حفظ سعة التاريخ');
  const table = panel.getByRole('table', { name: 'تواريخ محددة' });
  await expect(table.getByText('الافتراضي')).toBeVisible();
  await expect(table.getByText('3', { exact: true })).toBeVisible();

  await page.reload();
  await page.getByRole('tab', { name: 'السعة' }).click();
  await expect(page.getByRole('tabpanel').getByLabel('الحد الأقصى للطلبات يوميًا')).toHaveValue('30');
  await page.getByRole('tabpanel').getByRole('button', { name: /^إزالة / }).click();
  await toast(page, 'تمت إزالة التاريخ');
  await expect(page.getByText('لا توجد تواريخ محددة')).toBeVisible();
});

test('not allowed and load error states', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.route('**/api/admin/settings/operations', (route) => route.fulfill({ status: 502, json: { code: 'NETWORK' } }), { times: 1 });
  await page.goto('/admin/settings/operations');
  await expect(page.getByText('تعذّر تحميل الإعدادات التشغيلية')).toBeVisible();
  await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
  await expect(page.getByRole('region', { name: 'استقبال الطلبات' })).toBeVisible();

  await context.addCookies([{ url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/settings/operations');
  await expect(page.getByText('ليست لديك صلاحية تعديل الإعدادات التشغيلية')).toBeVisible();
  await expect(page.getByRole('banner').getByRole('switch')).toHaveCount(0);
});
