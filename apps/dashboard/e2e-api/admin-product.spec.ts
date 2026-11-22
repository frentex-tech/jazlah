import { expect, test } from '@playwright/test';
import { ADMIN, PNG, RUN, apiGet, publicCard, signInTo, toast } from './helpers';

// CAT-DSH-1 against the real API: a JAZLA carcass with 3 sizes, cuts (one with an extra price), packaging and
// exclusions, saved as a draft, published (it reaches GET /v1/public/products), then a live price edit (PATCH prices)
// and one size switched off (PATCH availability with `sizes`). It offers quarters in a tray, a pair the seeded rules
// forbid, and mandi cut in a vacuum bag, a pair the admin forbids from the form's matrix (a global rule, POST
// /v1/admin/cutting-packaging-incompatibilities): publishing is not refused, the public product lists both pairs for the
// app to block (#290). Needs a freshly seeded API: on a second run the matrix click would allow the pair again.
const NAME = `ذبيحة نعيمي ${RUN}`;
const NAME_EN = `Acceptance Naimi carcass ${RUN}`;

test('create, save, publish and edit a price of a JAZLA product', async ({ page }) => {
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/products/new');
  await expect(page.getByRole('heading', { level: 1, name: 'منتج جديد' })).toBeVisible();
  await expect(page.getByLabel('التصنيف', { exact: true }).locator('option', { hasText: 'ذبائح كاملة' })).toHaveCount(1, { timeout: 15_000 });

  await page.getByLabel('اسم المنتج', { exact: true }).fill(NAME);
  await page.getByLabel('اسم المنتج بالإنجليزية').fill(NAME_EN);
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'ذبائح كاملة' });
  await page.getByLabel('نوع اللحم').selectOption({ label: 'نعيمي' });
  await page.locator('input[type=file]').setInputFiles({ name: 'carcass.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'صورة الغلاف، 1 من 1' })).toBeVisible({ timeout: 15_000 });

  const sizes: [string, string, string, string][] = [['صغير', 'Small', '8000', '950'], ['وسط', 'Medium', '12000', '1250'], ['كبير', 'Large', '16000', '1550']];
  for (const [i, [ar, en, grams, price]] of sizes.entries()) {
    await page.getByRole('button', { name: 'إضافة حجم' }).click();
    await page.getByLabel(`وصف الحجم ${i + 1}`, { exact: true }).fill(ar);
    await page.getByLabel(`وصف الحجم ${i + 1} بالإنجليزية`).fill(en);
    await page.getByLabel(`وزن الحجم ${i + 1} بالجرام`).fill(grams);
    await page.getByLabel(`سعر الحجم ${i + 1}`).fill(price);
  }
  await page.getByRole('button', { name: 'تقطيع ثلاجة', exact: true }).click();
  await page.getByRole('button', { name: 'تقطيع مندي', exact: true }).click();
  await page.getByLabel('السعر الإضافي لـتقطيع مندي').fill('25');
  await page.getByRole('button', { name: 'أرباع', exact: true }).click();
  await page.getByLabel('كيس مفرّغ', { exact: true }).check();
  await page.getByLabel('علبة مبرّدة', { exact: true }).check();
  await page.getByRole('button', { name: 'الرأس', exact: true }).click();
  await page.getByRole('button', { name: 'الكرشة', exact: true }).click();

  // The incompatibility rule, made from the UI: mandi cut cannot go in a vacuum bag, for every product.
  await expect(page.getByRole('button', { name: 'أرباع مع علبة مبرّدة: غير متوافق' })).toBeVisible(); // the seeded rule
  await page.getByRole('button', { name: 'تقطيع مندي مع كيس مفرّغ: متوافق' }).click();
  await page.getByRole('dialog', { name: 'تغيير قاعدة التوافق لكل المنتجات؟' }).getByRole('button', { name: 'تغيير القاعدة' }).click();
  await expect(page.getByRole('button', { name: 'تقطيع مندي مع كيس مفرّغ: غير متوافق' })).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'حفظ كمسودة' }).click();
  await toast(page, `تم حفظ ${NAME}`);
  await expect(page).toHaveURL(/\/admin\/catalog\/products\/[0-9a-f-]{36}$/);
  expect(await publicCard(NAME_EN)).toBeNull(); // a draft is not public

  await page.getByRole('button', { name: 'حفظ ونشر' }).click();
  await toast(page, `تم نشر ${NAME}`);
  expect(await publicCard(NAME_EN)).toMatchObject({ minPriceHalalas: 95000 });
  const id = page.url().split('/').pop()!;
  type PublicProduct = {
    isAvailable: boolean;
    cuttings: { cuttingStyleId: string; name: { ar: string } }[];
    incompatiblePairs: { cuttingStyleId: string; packaging: string }[];
    sizes: { approxWeightGrams: number; isAvailable: boolean }[];
    defaultSizeId: string | null;
  };
  const pub = () => apiGet<PublicProduct>(`/v1/public/products/${id}`);
  const live = await pub();
  expect(live.isAvailable).toBe(true);
  const cut = (ar: string) => live.cuttings.find((c) => c.name.ar === ar)!.cuttingStyleId;
  expect(live.incompatiblePairs).toHaveLength(2);
  expect(live.incompatiblePairs).toEqual(
    expect.arrayContaining([{ cuttingStyleId: cut('أرباع'), packaging: 'trays' }, { cuttingStyleId: cut('تقطيع مندي'), packaging: 'vacuum' }]),
  );

  // Reloaded from the API: everything was saved.
  await page.reload();
  await expect(page.getByLabel('سعر الحجم 3')).toHaveValue('1550.00');
  await expect(page.getByLabel('السعر الإضافي لـتقطيع مندي')).toHaveValue('25.00');
  await expect(page.getByRole('button', { name: 'الكرشة', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // A live price on the published product applies at once (PATCH …/prices before any PUT).
  await page.getByLabel('سعر الحجم 1').fill('900');
  await page.getByRole('button', { name: 'حفظ التعديلات' }).click();
  await toast(page, `تم حفظ ${NAME}`);
  await page.reload();
  await expect(page.getByLabel('سعر الحجم 1')).toHaveValue('900.00');
  expect(await publicCard(NAME_EN)).toMatchObject({ minPriceHalalas: 90000 });

  // One size out of stock: the product stays on sale, the size is shown but not orderable.
  await page.getByRole('switch', { name: 'الحجم 3 متاح للطلب' }).click();
  await page.getByRole('button', { name: 'حفظ التعديلات' }).click();
  await toast(page, `تم حفظ ${NAME}`);
  await page.reload();
  await expect(page.getByRole('switch', { name: 'الحجم 3 متاح للطلب' })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('switch', { name: 'الحجم 1 متاح للطلب' })).toHaveAttribute('aria-checked', 'true');
  const shelf = (await pub()).sizes;
  expect(shelf.find((x) => x.approxWeightGrams === 16000)).toMatchObject({ isAvailable: false });
  expect(shelf.find((x) => x.approxWeightGrams === 8000)).toMatchObject({ isAvailable: true });
});

test("the API's refusal lands on its field: publishing without an image", async ({ page }) => {
  const name = `ذبيحة بلا صورة ${RUN}`;
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/products/new');
  await expect(page.getByLabel('التصنيف', { exact: true }).locator('option', { hasText: 'ذبائح كاملة' })).toHaveCount(1, { timeout: 15_000 });
  await page.getByLabel('اسم المنتج', { exact: true }).fill(name);
  await page.getByLabel('اسم المنتج بالإنجليزية').fill(`Acceptance imageless carcass ${RUN}`);
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'ذبائح كاملة' });
  await page.getByRole('button', { name: 'إضافة حجم' }).click();
  await page.getByLabel('وزن الحجم 1 بالجرام').fill('9000');
  await page.getByLabel('سعر الحجم 1').fill('900');
  // The draft is saved, then POST …/publish answers PRODUCT_NOT_SUBMITTABLE with reasons [NO_IMAGE]: on the images field.
  await page.getByRole('button', { name: 'حفظ ونشر' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'أضف صورة واحدة على الأقل قبل النشر' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel('اسم المنتج', { exact: true })).not.toHaveAttribute('aria-invalid', 'true');
  expect(await publicCard(`Acceptance imageless carcass ${RUN}`)).toBeNull();
});
