import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

test('visiting /admin without a session redirects to /login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?panel=admin&next=%2Fadmin$/);
});

test('a vendor session cannot open the admin panel', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?panel=admin/);
});

for (const [panel, title, items] of [
  ['admin', 'لوحة المعلومات', 13],
  ['vendor', 'الطلبات', 6],
  ['kitchen', 'لوحة المطبخ · اليوم', 1],
] as const) {
  test(`${panel} shell renders its side nav, top bar and header`, async ({ page, context }) => {
    await signInAs(context, [panel]);
    await page.goto(`/${panel}`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    const nav = page.getByRole('navigation', { name: 'القائمة الرئيسية' });
    await expect(nav.getByRole('link')).toHaveCount(items);
    await expect(nav.locator('[aria-current=page]')).toHaveCount(1);
    await expect(page.getByRole('searchbox', { name: 'ابحث برقم الطلب أو العميل' })).toBeVisible();
  });
}

test('English mirrors the layout', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/en/admin');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Overview');
});

test('a nav item without a page shows the localised not-found inside the shell', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/customers');
  await expect(page.getByRole('status').filter({ hasText: 'الصفحة غير موجودة' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' })).toBeVisible();
  await page.getByRole('link', { name: 'العودة للرئيسية' }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test('settings opens the coverage zones, and unknown addresses outside the panels are localised', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/admin\/settings\/coverage$/);
  await page.goto('/en/nowhere');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test('the denied screen follows the Figma frame', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  await page.goto('/vendor/denied');
  await expect(page.getByRole('status').filter({ hasText: 'ليست لديك صلاحية' })).toContainText('تواصل مع مدير الحساب للحصول على الوصول.');
  await expect(page.getByRole('button', { name: 'رجوع' })).toBeVisible();
});

test('the vendor application address stays outside the staff shell for visitors', async ({ page }) => {
  await page.goto('/vendor/apply');
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' })).toHaveCount(0);
});
