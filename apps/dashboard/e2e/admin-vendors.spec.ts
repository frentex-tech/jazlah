import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/admin-vendors/backend.ts): seeds follow 131:16744. Pending: ملحمة النخبة (جدة), مزارع الواحة;
// active: مجازر الفلاح, ذبائح الرياض; suspended: أسواق الراعي. An access token ending in «-limited» is refused (PERMISSION_DENIED).
// One server and one mock store for the whole run: each test acts on its own seed.

const table = (page: Page) => page.getByRole('table', { name: 'المتاجر' });

test('the list: status tabs, search, city filter and the empty state', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await expect(page.getByRole('heading', { level: 1, name: 'المتاجر' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'نشطة' })).toHaveAttribute('aria-selected', 'true');
  await expect(table(page).getByRole('link', { name: 'مجازر الفلاح', exact: true })).toBeVisible();
  await expect(table(page).getByText('8%')).toBeVisible();

  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await expect(table(page).getByRole('link', { name: 'مزارع الواحة', exact: true })).toBeVisible();
  await expect(page.getByText('الحالة: قيد المراجعة')).toBeVisible(); // the tab is also an applied filter chip

  await page.getByRole('searchbox', { name: 'ابحث باسم المتجر أو السجل التجاري' }).fill('4030521187');
  await expect(table(page).getByRole('link', { name: 'مزارع الواحة', exact: true })).toHaveCount(0);
  await expect(table(page).getByRole('link', { name: 'ملحمة النخبة', exact: true })).toBeVisible();

  await page.getByLabel('المدينة').selectOption('تبوك');
  await expect(page.getByText('لا توجد متاجر مطابقة')).toBeVisible();
  await page.getByRole('button', { name: 'مسح التصفية' }).click();
  await expect(page.getByRole('tab', { name: 'نشطة' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('searchbox', { name: 'ابحث باسم المتجر أو السجل التجاري' })).toHaveValue('');
});

test('approve an application with a commission: the store becomes an active vendor', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await table(page).getByRole('link', { name: 'ملحمة النخبة', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'مراجعة: ملحمة النخبة' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'السجل التجاري', pressed: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'السجل التجاري' })).toBeVisible();
  await page.getByRole('button', { name: 'رخصة البلدية' }).click();
  await expect(page.getByRole('img', { name: 'رخصة البلدية' })).toBeVisible();

  await page.getByRole('button', { name: 'اعتماد المتجر' }).click();
  const dialog = page.getByRole('dialog', { name: 'اعتماد ملحمة النخبة' });
  await dialog.getByLabel('نسبة العمولة (%)').fill('12.555');
  await dialog.getByRole('button', { name: 'اعتماد وتفعيل' }).click();
  await expect(dialog.getByText('أدخل نسبة من 0 إلى 100، بمنزلتين عشريتين على الأكثر')).toBeVisible();
  await dialog.getByLabel('نسبة العمولة (%)').fill('12.5');
  await dialog.getByRole('button', { name: 'اعتماد وتفعيل' }).click();

  await expect(page.getByRole('status').getByText('تم اعتماد ملحمة النخبة وتفعيله')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المتجر نشط' })).toBeVisible();
  await expect(page.getByText('12.5%')).toBeVisible();
  await expect(page).not.toHaveURL(/5a000000-0000-4000-8000-000000000001/); // the vendor's own address now

  // The page now acts on the new vendor. Another admin suspends it first (second tab, at the vendor's address): our
  // suspend answers CONFLICT, and the quiet reload shows the vendor suspended, not the old application.
  const other = await context.newPage();
  await other.goto(page.url());
  await other.getByRole('button', { name: 'إيقاف المتجر' }).click();
  await other.getByRole('dialog', { name: 'إيقاف المتجر' }).getByLabel('سبب الإيقاف').fill('مراجعة الجودة');
  await other.getByRole('dialog', { name: 'إيقاف المتجر' }).getByRole('button', { name: 'إيقاف المتجر' }).click();
  await expect(other.getByRole('heading', { name: 'المتجر موقوف' })).toBeVisible();
  await other.close();
  await page.getByRole('button', { name: 'إيقاف المتجر' }).click();
  await page.getByRole('dialog', { name: 'إيقاف المتجر' }).getByLabel('سبب الإيقاف').fill('مراجعة الجودة');
  await page.getByRole('dialog', { name: 'إيقاف المتجر' }).getByRole('button', { name: 'إيقاف المتجر' }).click();
  await expect(page.getByRole('status').getByText('تغيّرت حالة المتجر، وهذه حالته الآن')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المتجر موقوف' })).toBeVisible();

  // Back to the list (client navigation): the application left «pending», the vendor is in «suspended».
  await page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'المتاجر' }).click();
  await page.getByRole('tab', { name: 'موقوفة' }).click();
  await expect(table(page).getByRole('link', { name: 'ملحمة النخبة', exact: true })).toBeVisible();
  await expect(table(page).getByText('12.5%')).toBeVisible();
  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await expect(table(page).getByRole('link', { name: 'مزارع الواحة', exact: true })).toBeVisible();
  await expect(table(page).getByRole('link', { name: 'ملحمة النخبة', exact: true })).toHaveCount(0);
});

test('reject an application with a reason', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await table(page).getByRole('link', { name: 'مزارع الواحة', exact: true }).click();
  await page.getByRole('button', { name: 'رفض الطلب' }).click();

  const dialog = page.getByRole('dialog', { name: 'رفض الطلب' });
  await dialog.getByRole('button', { name: 'تأكيد الرفض' }).click();
  await expect(dialog.getByText('اكتب السبب')).toBeVisible();
  await dialog.getByRole('button', { name: 'مستند منتهي' }).click();
  await expect(dialog.getByLabel('سبب الرفض')).toHaveValue('أحد المستندات منتهي الصلاحية، ارفع نسخة سارية.');
  await dialog.getByRole('button', { name: 'تأكيد الرفض' }).click();

  await expect(page.getByRole('status').getByText('تم رفض طلب مزارع الواحة')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'الطلب مرفوض' })).toBeVisible();
  await expect(page.getByText('أحد المستندات منتهي الصلاحية، ارفع نسخة سارية.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'اعتماد المتجر' })).toHaveCount(0);
});

test('suspend a vendor with a reason, then reactivate it', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await table(page).getByRole('link', { name: 'ذبائح الرياض', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'المتجر نشط' })).toBeVisible();

  await page.getByRole('button', { name: 'إيقاف المتجر' }).click();
  const dialog = page.getByRole('dialog', { name: 'إيقاف المتجر' });
  await dialog.getByLabel('سبب الإيقاف').fill('تكرار شكاوى جودة التغليف');
  await dialog.getByRole('button', { name: 'إيقاف المتجر' }).click();
  await expect(page.getByRole('status').getByText('تم إيقاف ذبائح الرياض')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المتجر موقوف' })).toBeVisible();
  await expect(page.getByText('تكرار شكاوى جودة التغليف')).toBeVisible();

  await page.getByRole('button', { name: 'إعادة تفعيل المتجر' }).click();
  await page.getByRole('dialog', { name: 'إعادة تفعيل ذبائح الرياض' }).getByRole('button', { name: 'إعادة التفعيل' }).click();
  await expect(page.getByRole('status').getByText('تمت إعادة تفعيل ذبائح الرياض')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'المتجر نشط' })).toBeVisible();
});

test('an admin without the permission sees the not-allowed states, still signed in', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await context.addCookies([{ url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/vendors');
  await expect(page.getByText('ليست لديك صلاحية لإدارة المتاجر')).toBeVisible();
  await expect(page.getByRole('link', { name: 'العودة للوحة المعلومات' })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(0);

  await page.goto('/admin/vendors/5a000000-0000-4000-8000-000000000002');
  await expect(page.getByText('ليست لديك صلاحية لمراجعة الطلبات')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/vendors\//);
});

test('English mirrors the list; an unknown id is not found', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/en/admin/vendors');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  const stores = page.getByRole('table', { name: 'Stores' });
  await expect(stores.getByRole('link', { name: 'Al Falah Butchery', exact: true })).toBeVisible();
  await expect(stores.getByText('Riyadh').first()).toBeVisible();
  await page.goto('/en/admin/vendors/not-an-id');
  await expect(page.getByText('Store not found')).toBeVisible();
});
