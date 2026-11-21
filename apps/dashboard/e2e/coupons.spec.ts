import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/coupons/backend.mock.ts): six coupons around today, one per status, FALAH15 scoped to a store and a
// category. One server and one mock store for the whole run: codes made here are unique to the run.

const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const table = (page: Page) => page.getByRole('table', { name: 'الكوبونات' });
const riyadh = (days: number) => new Date(Date.now() + days * 86_400_000 + 3 * 3_600_000).toISOString().slice(0, 10);

test('list, status filter and code search; the side nav reaches it', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin');
  await page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'التسويق' }).click();
  await expect(page).toHaveURL(/\/admin\/marketing\/coupons$/);
  await expect(page.getByRole('heading', { level: 1, name: 'الكوبونات' })).toBeVisible();
  const ramadan = table(page).getByRole('row').filter({ hasText: 'RAMADAN25' });
  await expect(ramadan).toContainText('نسبة مئوية · 25%');
  await expect(ramadan).toContainText('فعّال');
  await expect(ramadan).toContainText('132 / 500');
  await expect(table(page).getByRole('row').filter({ hasText: 'WELCOME50' })).toContainText('/ بلا حد');

  await page.getByLabel('حالة الكوبون').selectOption('expired');
  await expect(table(page).getByRole('link', { name: 'NATIONAL94', exact: true })).toBeVisible();
  await expect(table(page).getByRole('link', { name: 'RAMADAN25', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /الحالة: منتهي/ })).toBeVisible();

  // Filtered empty: the bar stays, with its text and chip.
  await page.getByRole('searchbox', { name: 'ابحث برمز الكوبون' }).fill('zzz');
  await expect(page.getByText('لا توجد كوبونات مطابقة')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'ابحث برمز الكوبون' })).toHaveValue('zzz');
  await page.getByRole('button', { name: 'مسح التصفية' }).click();
  await page.getByRole('searchbox', { name: 'ابحث برمز الكوبون' }).fill('eid');
  await expect(table(page).getByRole('row')).toHaveCount(2); // header + EID10
  await expect(table(page)).toContainText('مجدول');
});

test('create with validation errors, then a duplicate code, then success', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/marketing/coupons');
  await page.getByRole('link', { name: 'كوبون جديد' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'كوبون جديد' })).toBeVisible();

  await page.getByLabel('رمز الكوبون').fill('a b');
  await page.getByLabel('نسبة الخصم (%)').fill('150');
  await page.getByLabel('يبدأ في').fill(`${riyadh(2)}T10:00`);
  await page.getByLabel('ينتهي في').fill(`${riyadh(1)}T10:00`);
  await page.getByLabel('حد الاستخدام الكلي').fill('0');
  await page.getByRole('button', { name: 'إنشاء الكوبون' }).click();
  await toast(page, 'راجع الحقول المظللة');
  await expect(page.getByText('أدخل رمزًا من 3 إلى 32 حرفًا لاتينيًا أو رقمًا أو «-» أو «_»')).toBeVisible();
  await expect(page.getByText('أدخل نسبة من 1 إلى 100')).toBeVisible();
  await expect(page.getByText('يجب أن تكون النهاية بعد البداية')).toBeVisible();
  await expect(page.getByText('أدخل عددًا أكبر من صفر')).toBeVisible();
  await expect(page.getByLabel('نسبة الخصم (%)')).toHaveAttribute('aria-invalid', 'true');

  // A fixed amount; the code is taken by RAMADAN25 in another case.
  await page.getByLabel('رمز الكوبون').fill('ramadan25');
  await page.getByLabel('نوع الخصم').selectOption('fixed');
  await page.getByLabel('قيمة الخصم (ر.س)').fill('30');
  await page.getByLabel('ينتهي في').fill(`${riyadh(30)}T23:59`);
  await page.getByLabel('حد الاستخدام الكلي').fill('');
  await page.getByLabel('الحد الأدنى للطلب (ر.س)').fill('150');
  await page.getByRole('button', { name: 'مجازر الفلاح' }).click();
  await page.getByRole('button', { name: 'الأغنام' }).click();
  await page.getByRole('switch', { name: 'للطلب الأول فقط' }).click();
  await page.getByRole('button', { name: 'إنشاء الكوبون' }).click();
  await expect(page.getByText('هذا الرمز مستخدم لكوبون آخر')).toBeVisible();

  const code = `NEW${Date.now() % 100000}`;
  await page.getByLabel('رمز الكوبون').fill(code.toLowerCase());
  await page.getByRole('button', { name: 'إنشاء الكوبون' }).click();
  await toast(page, `تم إنشاء الكوبون ${code}`);
  await expect(page.getByRole('heading', { level: 1, name: code })).toBeVisible();
  await expect(page.getByLabel('قيمة الخصم (ر.س)')).toHaveValue('30.00');
  await expect(page.getByLabel('الحد الأدنى للطلب (ر.س)')).toHaveValue('150.00');
  await expect(page.getByRole('button', { name: 'مجازر الفلاح' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('switch', { name: 'للطلب الأول فقط' })).toBeChecked();
  await expect(page.getByLabel('يبدأ في')).toHaveValue(`${riyadh(2)}T10:00`);
  await expect(page.getByText('0 / بلا حد')).toBeVisible();
});

test('edit, usage stats and deactivate', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/marketing/coupons');
  await table(page).getByRole('link', { name: 'FALAH15', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'FALAH15' })).toBeVisible();
  const usage = page.locator('section').filter({ has: page.getByRole('heading', { name: 'الاستخدام' }) });
  await expect(usage).toContainText('100 / 100');
  await expect(usage).toContainText('61');
  await expect(usage).toContainText('1,875.00 ر.س');
  await expect(page.getByRole('button', { name: 'مجازر الفلاح' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByLabel('نسبة الخصم (%)').fill('20');
  await page.getByLabel('حد الاستخدام لكل عميل').fill('3');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await toast(page, 'تم حفظ الكوبون FALAH15');
  await page.reload();
  await expect(page.getByLabel('نسبة الخصم (%)')).toHaveValue('20');
  await expect(page.getByLabel('حد الاستخدام لكل عميل')).toHaveValue('3');

  await page.getByRole('button', { name: 'إيقاف الكوبون' }).click();
  const dialog = page.getByRole('dialog', { name: /^إيقاف الكوبون .FALAH15.؟$/ });
  await dialog.getByRole('button', { name: 'إيقاف' }).click();
  await toast(page, 'تم إيقاف الكوبون FALAH15');
  await expect(page.getByRole('button', { name: 'إيقاف الكوبون' })).toHaveCount(0);
  await expect(page.getByRole('switch', { name: 'الكوبون مفعّل' })).not.toBeChecked();
  await page.goto('/admin/marketing/coupons');
  await expect(table(page).getByRole('row').filter({ hasText: 'FALAH15' })).toContainText('موقوف');

  // Back on for the other runs.
  await table(page).getByRole('link', { name: 'FALAH15', exact: true }).click();
  await page.getByRole('switch', { name: 'الكوبون مفعّل' }).click();
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await toast(page, 'تم حفظ الكوبون FALAH15');
});

test('error, not found and not allowed states', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.route('**/api/admin/coupons?*', (route) => route.fulfill({ status: 502, json: { code: 'NETWORK' } }), { times: 1 });
  await page.goto('/admin/marketing/coupons');
  await expect(page.getByText('تعذّر تحميل الكوبونات')).toBeVisible();
  await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
  await expect(table(page)).toBeVisible();

  await page.goto('/admin/marketing/coupons/00000000-0000-4000-8000-000000000000');
  await expect(page.getByText('الكوبون غير موجود')).toBeVisible();

  await context.addCookies([{ url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/marketing/coupons');
  await expect(page.getByText('ليست لديك صلاحية لإدارة الكوبونات')).toBeVisible();
  await expect(page.getByRole('link', { name: 'كوبون جديد' })).toHaveCount(0);
  await page.goto('/admin/marketing/coupons/c0000000-0000-4000-8000-000000000001');
  await expect(page.getByText('ليست لديك صلاحية لإدارة الكوبونات')).toBeVisible();
});

test('English mirrors the list and the form', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/en/admin/marketing/coupons');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1, name: 'Coupons' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Coupons' }).getByRole('row').filter({ hasText: 'WELCOME50' })).toContainText('Fixed amount · SAR 50.00');
  await page.getByRole('link', { name: 'New coupon' }).click();
  await expect(page.getByLabel('Discount (%)')).toBeVisible();
  await expect(page.getByText('No store chosen: applies to every store')).toBeVisible();
});
