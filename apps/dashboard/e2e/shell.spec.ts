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
  ['admin', 'لوحة المعلومات', 12],
  ['vendor', 'الطلبات المباشرة', 6],
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

test('DataTable demo paginates against the mocked endpoint', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/table-demo');
  await expect(page.getByText('عرض 1 إلى 5 من 128')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(6);
  await page.getByRole('button', { name: 'الصفحة التالية' }).click();
  await expect(page.getByText('عرض 6 إلى 10 من 128')).toBeVisible();
  await expect(page.getByRole('cell', { name: '#10477' })).toBeVisible();
});

test('DataTable filters and shows the error state', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/table-demo');
  await page.getByRole('combobox', { name: 'الحالة' }).selectOption('cancelled');
  await expect(page.getByText(/من 25$/)).toBeVisible();
  await page.goto('/admin/table-demo?fail=1');
  await expect(page.getByRole('alert').filter({ hasText: 'حدث خطأ غير متوقع' })).toBeVisible();
});
