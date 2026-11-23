import { expect, test } from '@playwright/test';
import { ADMIN, CUSTOMER, customerToken, signIn, signInTo } from './helpers';

// ACC-DSH-1 against the real API: the seeded super-admin signs in and out (the sign-out redirect is relative, #22), and
// a customer-only phone is refused with the no-access line (the API answers OTP_INVALID, as for a wrong code).

test('the seeded super-admin signs in, and signs out with a relative redirect that ends the session', async ({ page }) => {
  await signInTo(page, 'admin', ADMIN);
  const logout = page.waitForResponse((r) => r.url().endsWith('/api/auth/logout'));
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  const res = await logout;
  expect(res.status()).toBe(303);
  expect(res.headers()['location']).toBe('/login'); // no host: behind a proxy req.url is an internal address
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?panel=admin/);
});

test('a phone without dashboard access gets the no-access line on the staff sign-in', async ({ page }) => {
  await customerToken(CUSTOMER); // a customer account, with no staff access
  await page.goto('/login');
  await signIn(page, CUSTOMER);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('الرمز غير صحيح أو الرقم غير مصرّح له، حاول مرة أخرى');
  await expect(page).toHaveURL(/\/login$/);
});
