import { expect, test } from '@playwright/test';
import { ADMIN, PNG, RUN, VENDOR, publicCard, rowOf, signInTo, toast } from './helpers';

// CAT-DSH-2 against the real API: the seeded vendor (ملحمة النخبة) submits a new product (refused first without an image,
// PRODUCT_NOT_SUBMITTABLE), it shows in the admin review queue (GET /v1/admin/review-queue, next to the seeded edit of
// «نعيمي كامل»), the admin approves it, and it reaches GET /v1/public/products.
const NAME = `فخذ عجل ${RUN}`;
const NAME_EN = `Acceptance veal leg ${RUN}`;
const EDITED = `فخذ عجل طازج ${RUN}`;

test.describe.configure({ mode: 'serial' });

test('a vendor submits a product, an admin approves it from the queue, and it is public', async ({ page }) => {
  await signInTo(page, 'vendor', VENDOR);
  await page.goto('/vendor/products/new');
  await expect(page.getByLabel('التصنيف', { exact: true }).locator('option', { hasText: 'لحوم مقطعة' })).toHaveCount(1, { timeout: 15_000 });
  await page.getByLabel('اسم المنتج', { exact: true }).fill(NAME);
  await page.getByLabel('اسم المنتج بالإنجليزية').fill(NAME_EN);
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'لحوم مقطعة' });
  await page.getByRole('button', { name: 'إضافة حجم' }).click();
  await page.getByLabel('وزن الحجم 1 بالجرام').fill('1000');
  await page.getByLabel('سعر الحجم 1').fill('120');
  // No image: the draft is saved, the submission refused (NO_IMAGE) on the images field.
  await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
  await expect(page.getByText('أضف صورة واحدة على الأقل قبل النشر')).toBeVisible({ timeout: 15_000 });
  await page.locator('input[type=file]').setInputFiles({ name: 'veal.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'صورة الغلاف، 1 من 1' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
  await toast(page, `أُرسل ${NAME} للمراجعة`);
  await expect(page.getByText('المنتج قيد المراجعة ولا يمكن تعديله')).toBeVisible();
  expect(await publicCard(NAME_EN)).toBeNull();

  await page.context().clearCookies();
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/review');
  const queue = page.getByRole('table', { name: 'قيد المراجعة' });
  await expect(rowOf(page, queue, NAME).getByText('منتج جديد')).toBeVisible({ timeout: 15_000 });
  // One list: the seeded pending edit is there too, and its dialog shows the proposal (its new size has no availability).
  await expect(rowOf(page, queue, 'نعيمي كامل').getByText('تعديل منتج')).toBeVisible();
  await page.getByRole('button', { name: 'مراجعة نعيمي كامل', exact: true }).click();
  const edit = page.getByRole('dialog', { name: 'مراجعة: ذبيحة نعيمي كاملة طازجة' });
  await expect(edit.getByText('الاسم والوصف', { exact: false })).toBeVisible();
  await edit.getByRole('button', { name: 'إغلاق' }).click();
  // The kind filter, and the count of the side nav badge (the whole queue, whatever the page size).
  await page.getByLabel('نوع الطلب').selectOption({ label: 'منتج جديد' });
  await expect(rowOf(page, queue, 'نعيمي كامل')).toHaveCount(0);
  await expect(rowOf(page, queue, NAME)).toHaveCount(1);
  const counted = await page.request.get('/api/admin/catalog/review-queue?limit=1');
  const { count, items } = (await counted.json()) as { count: number; items: unknown[] };
  expect(items).toHaveLength(1);
  expect(count).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: /المنتجات/ })).toContainText(String(count));
  await page.getByRole('button', { name: `مراجعة ${NAME}` }).click();
  const dialog = page.getByRole('dialog', { name: `مراجعة: ${NAME}` });
  await expect(dialog.getByText('120.00 ر.س')).toBeVisible();
  await dialog.getByRole('button', { name: 'اعتماد ونشر' }).click();
  await toast(page, `اعتُمد ${NAME} ونُشر`);
  await expect(queue.getByText(NAME)).toHaveCount(0);

  expect(await publicCard(NAME_EN)).toMatchObject({ minPriceHalalas: 12000 });
});

test('the vendor switches it off and on, then edits it; the admin rejects the edit with a reason', async ({ page }) => {
  const live = (await publicCard(NAME_EN))!;
  await signInTo(page, 'vendor', VENDOR);
  await page.goto('/vendor/products');
  await page.getByRole('button', { name: `إجراءات ${NAME}` }).click();
  await page.getByRole('button', { name: 'إيقاف الطلب' }).click();
  await toast(page, `أُوقف طلب ${NAME}`);
  expect(await publicCard(NAME_EN)).toBeNull(); // out of stock: left out of the public list
  await page.getByRole('button', { name: `إجراءات ${NAME}` }).click();
  await page.getByRole('button', { name: 'إتاحة للطلب' }).click();
  await expect.poll(() => publicCard(NAME_EN)).not.toBeNull();

  // A review-sensitive edit warns, and becomes a change request: the live product keeps its name.
  await page.goto(`/vendor/products/${live.id}`);
  await page.getByLabel('اسم المنتج', { exact: true }).fill(EDITED);
  await expect(page.getByText('سيُعاد مراجعة المنتج', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'حفظ التعديلات' }).click();
  await toast(page, `أُرسل تعديل ${NAME} للمراجعة`);

  await page.context().clearCookies();
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/review');
  const queue = page.getByRole('table', { name: 'قيد المراجعة' });
  await expect(rowOf(page, queue, NAME).getByText('تعديل منتج')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: `مراجعة ${NAME}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `مراجعة: ${EDITED}` });
  await dialog.getByRole('button', { name: 'صورة غير واضحة' }).click();
  await dialog.getByRole('button', { name: 'رفض مع السبب' }).click();
  await toast(page, `رُفض ${EDITED} وأُرسل السبب للبائع`);
  await expect(rowOf(page, queue, NAME)).toHaveCount(0);
  expect(await publicCard(NAME_EN)).toMatchObject({ name: { en: NAME_EN } });
});
