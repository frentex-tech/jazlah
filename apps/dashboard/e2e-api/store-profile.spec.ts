import { expect, test } from '@playwright/test';
import { PNG, RUN, VENDOR, apiGet, signInTo } from './helpers';

// VND-DSH-1 against the real API: the seeded vendor (ملحمة النخبة) saves its store page (descriptions and a new logo,
// uploaded with a presigned POST), and the change is on the public store endpoint GET /v1/public/vendors/{id}.
type PublicVendor = { id: string; description: { ar: string | null; en: string | null }; logoUrl: string | null };

test('a store profile save shows on the public store endpoint', async ({ page }) => {
  await signInTo(page, 'vendor', VENDOR);
  await page.goto('/vendor/store');
  await expect(page.getByLabel('اسم المتجر', { exact: true })).toHaveValue('ملحمة النخبة', { timeout: 15_000 });
  const profile = await page.request.get('/api/vendor/profile');
  const { id } = (await profile.json()) as { id: string };
  const before = await apiGet<PublicVendor>(`/v1/public/vendors/${id}`);

  const ar = `ملحمة عائلية منذ ١٩٩٠ ${RUN}`;
  const en = `A family butchery since 1990 ${RUN}`;
  await page.getByLabel('وصف المتجر', { exact: true }).fill(ar);
  await page.getByLabel('وصف المتجر بالإنجليزية').fill(en);
  await page.locator('input[type=file]').first().setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'تغيير شعار المتجر' }).locator('img[src^="blob:"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'حفظنا التغييرات.' })).toBeVisible({ timeout: 15_000 });

  const after = await apiGet<PublicVendor>(`/v1/public/vendors/${id}`);
  expect(after.description).toEqual({ ar, en });
  expect(after.logoUrl).toBeTruthy();
  expect(after.logoUrl).not.toBe(before.logoUrl);
});
