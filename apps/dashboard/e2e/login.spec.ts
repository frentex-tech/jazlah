import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock accounts (src/lib/auth/backend.ts): 0500000004 admin, 0500000002 vendor, 0500000003 kitchen,
// 0500000009 all three, 0500000001 customer only, 0500000007 rate limited. Code = last digit × 6.

async function enterPhone(page: Page, phone: string) {
  await page.getByLabel('رقم الجوال').fill(phone);
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await expect(page.getByRole('heading', { name: 'أدخل رمز التحقق' })).toBeVisible();
}

test('admin signs in with phone and code and lands on the admin panel', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'تسجيل دخول الموظفين' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'إرسال الرمز' })).toBeDisabled();
  await enterPhone(page, '0500000004');
  await expect(page.getByText('\u2066+966 50 000 0004\u2069')).toBeVisible();
  await expect(page.getByRole('button', { name: /إعادة الإرسال بعد 00:\d\d/ })).toBeDisabled();
  await page.getByLabel('رمز التحقق').fill('444444');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText('+966 5•• ••• 004')).toBeVisible();
});

test('an incomplete number shows the field error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('رقم الجوال').fill('50000');
  await page.getByLabel('رقم الجوال').blur();
  await expect(page.getByRole('alert').filter({ hasText: 'رقم الجوال غير مكتمل' })).toBeVisible();
});

test('a wrong code and a customer-only number both say there may be no access, in the one error line', async ({ page }) => {
  await page.goto('/login');
  await enterPhone(page, '0500000001');
  await page.getByLabel('رمز التحقق').fill('111111');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('الرمز غير صحيح أو الرقم غير مصرّح له، حاول مرة أخرى');
});

test('rate limiting is shown on the phone step', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('رقم الجوال').fill('0500000007');
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'محاولات كثيرة. حاول بعد 42 ثانية.' })).toBeVisible();
  // Sending stays off until Retry-After has passed, even after editing the number.
  await expect(page.getByRole('button', { name: 'إرسال الرمز' })).toBeDisabled();
  await page.getByLabel('رقم الجوال').fill('0500000004');
  await expect(page.getByRole('button', { name: 'إرسال الرمز' })).toBeDisabled();
});

test('vendor sign-in has its own texts and the application link', async ({ page }) => {
  await page.goto('/vendor');
  await expect(page).toHaveURL(/\/login\?panel=vendor/);
  await expect(page.getByRole('heading', { name: 'دخول التجار' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'لوحة التاجر' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'قدّم طلب انضمام' })).toHaveAttribute('href', '/vendor/apply');
  await enterPhone(page, '0500000002');
  await page.getByLabel('رمز التحقق').fill('222222');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/vendor$/);
});

test('kitchen sign-in has its own texts', async ({ page }) => {
  await page.goto('/login?panel=kitchen');
  await expect(page.getByRole('heading', { name: 'دخول المطابخ' })).toBeVisible();
  await expect(page.getByText('حساب المطبخ تنشئه إدارة جزلة.')).toBeVisible();
});

test('the page asked for is opened after sign-in', async ({ page }) => {
  await page.goto('/admin/settings/coverage');
  await enterPhone(page, '0500000004');
  await page.getByLabel('رمز التحقق').fill('444444');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/admin\/settings\/coverage$/);
});

test('a user with several panels gets the picker', async ({ page }) => {
  await page.goto('/login?panel=admin');
  await enterPhone(page, '0500000009');
  await page.getByLabel('رمز التحقق').fill('999999');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/login?panel=vendor');
  await enterPhone(page, '0500000009');
  await page.getByLabel('رمز التحقق').fill('999999');
  await page.getByRole('button', { name: 'تأكيد' }).click();
  await expect(page).toHaveURL(/\/login\/choose$/);
  await expect(page.getByRole('link', { name: /لوحة تحكم الموظفين/ })).toBeVisible();
  await page.getByRole('link', { name: /لوحة التاجر/ }).click();
  await expect(page).toHaveURL(/\/vendor$/);
});

test('signed-in staff skip the sign-in screen, and sign-out ends every session', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?panel=admin/);
});

test('English sign-in mirrors the layout', async ({ page }) => {
  await page.goto('/en/login?panel=vendor');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Vendor sign-in' })).toBeVisible();
});

test('auth calls from another site are refused (login CSRF)', async ({ request }) => {
  const res = await request.post('/api/auth/otp/verify', {
    headers: { 'Content-Type': 'text/plain', Origin: 'https://evil.example' },
    data: JSON.stringify({ phone: '0500000004', panel: 'admin', code: '444444' }),
  });
  expect(res.status()).toBe(403);
});

test('an expired access token is refreshed on page load, and the refresh token rotated', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await context.clearCookies({ name: 'jz_at_admin' });
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin$/);
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === 'jz_at_admin')?.value).toBe('mock-at');
  expect(cookies.find((c) => c.name === 'jz_rt_admin')?.value).not.toBe('mock-rt-admin-1');
});

test('a refresh refused because the account was disabled says so on the sign-in page', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await context.clearCookies({ name: 'jz_at_admin' });
  await context.addCookies([{ name: 'jz_rt_admin', value: 'mock-rt-disabled', url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true }]);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?panel=admin&next=%2Fadmin&reason=disabled$/);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('هذا الحساب موقوف. تواصل مع إدارة جزلة.');
});

test('a refresh that fails for a passing reason keeps the session', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await context.clearCookies({ name: 'jz_at_admin' });
  await context.addCookies([{ name: 'jz_rt_admin', value: 'mock-rt-busy', url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true }]);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin$/);
  expect((await context.cookies()).find((c) => c.name === 'jz_rt_admin')?.value).toBe('mock-rt-busy');
});
