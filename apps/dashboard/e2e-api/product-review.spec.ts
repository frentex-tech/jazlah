import { expect, test } from '@playwright/test';
import { ADMIN, PNG, RUN, VENDOR, publicCard, rowOf, signInTo, toast } from './helpers';

// CAT-DSH-2 against the real API: the seeded vendor (ملحمة النخبة) submits a new product, it shows in the admin review
// queue, the admin approves it, and it reaches GET /v1/public/products.
const NAME = `فخذ عجل ${RUN}`;
const NAME_EN = `Acceptance veal leg ${RUN}`;

test('a vendor submits a product, an admin approves it from the queue, and it is public', async ({ page }) => {
  await signInTo(page, 'vendor', VENDOR);
  await page.goto('/vendor/products/new');
  await expect(page.getByLabel('التصنيف', { exact: true }).locator('option', { hasText: 'لحوم مقطعة' })).toHaveCount(1, { timeout: 15_000 });
  await page.getByLabel('اسم المنتج', { exact: true }).fill(NAME);
  await page.getByLabel('اسم المنتج بالإنجليزية').fill(NAME_EN);
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'لحوم مقطعة' });
  await page.locator('input[type=file]').setInputFiles({ name: 'veal.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'صورة الغلاف، 1 من 1' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'إضافة حجم' }).click();
  await page.getByLabel('وزن الحجم 1 بالجرام').fill('1000');
  await page.getByLabel('سعر الحجم 1').fill('120');
  await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
  await toast(page, `أُرسل ${NAME} للمراجعة`);
  await expect(page.getByText('المنتج قيد المراجعة ولا يمكن تعديله')).toBeVisible();
  expect(await publicCard(NAME_EN)).toBeNull();

  await page.context().clearCookies();
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/review');
  const queue = page.getByRole('table', { name: 'قيد المراجعة' });
  await expect(rowOf(page, queue, NAME).getByText('منتج جديد')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: `مراجعة ${NAME}` }).click();
  const dialog = page.getByRole('dialog', { name: `مراجعة: ${NAME}` });
  await expect(dialog.getByText('120.00 ر.س')).toBeVisible();
  await dialog.getByRole('button', { name: 'اعتماد ونشر' }).click();
  await toast(page, `اعتُمد ${NAME} ونُشر`);
  await expect(queue.getByText(NAME)).toHaveCount(0);

  expect(await publicCard(NAME_EN)).toMatchObject({ minPriceHalalas: 12000 });
});
