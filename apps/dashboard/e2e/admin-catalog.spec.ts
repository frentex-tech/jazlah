import { expect, test, type Locator, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/catalog/backend.ts): categories of 131:19875, products of 131:21286 (مندي لحم للولائم, ضلوع غنم
// للمشاوي and لحم مفروم ناعم are JAZLA's own), the cuts, packagings and "without" items of 131:35405. An access token
// ending in «-limited» is answered NOT_ALLOWED. One server and one mock store for the whole run.

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const categories = (page: Page) => page.getByRole('table', { name: 'التصنيفات' });
const products = (page: Page) => page.getByRole('table', { name: 'المنتجات' });
const rowOf = (page: Page, table: Locator, name: string) => table.getByRole('row').filter({ has: page.getByText(name, { exact: true }) });

test('categories: add, edit, hide and reorder by position', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/categories');
  await expect(page.getByRole('heading', { level: 1, name: 'التصنيفات' })).toBeVisible();
  await expect(rowOf(page, categories(page), 'الإبل').getByText('مخفي')).toBeVisible();

  await page.getByRole('button', { name: 'إضافة تصنيف' }).click();
  const add = page.getByRole('dialog', { name: 'إضافة تصنيف' });
  await add.getByLabel('اسم التصنيف').fill('الأسماك');
  await add.getByLabel('الاسم بالإنجليزية').fill('Fish');
  await add.getByRole('button', { name: 'حفظ' }).click();
  await expect(page.getByRole('status').getByText('تم حفظ تصنيف الأسماك')).toBeVisible();
  const fish = rowOf(page, categories(page), 'الأسماك');
  await expect(fish.getByText('Fish')).toBeVisible();
  await expect(fish.getByText('8', { exact: true })).toBeVisible(); // added last

  await page.getByRole('button', { name: 'تعديل الأسماك' }).click();
  const edit = page.getByRole('dialog', { name: 'تعديل تصنيف الأسماك' });
  await edit.getByLabel('اسم التصنيف').fill('المأكولات البحرية');
  await edit.getByRole('switch', { name: 'ظاهر في المتجر' }).click();
  await edit.getByRole('button', { name: 'حفظ' }).click();
  const sea = rowOf(page, categories(page), 'المأكولات البحرية');
  await expect(sea.getByText('مخفي')).toBeVisible();

  // Reorder: the new category to the top (keyboard way of the drag), saved, then still first after a reload.
  await page.getByRole('button', { name: 'ترتيب التصنيفات' }).click();
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'تقديم المأكولات البحرية' }).click();
  await page.getByRole('button', { name: 'حفظ الترتيب' }).click();
  await expect(page.getByRole('status').getByText('تم حفظ ترتيب التصنيفات')).toBeVisible();
  await page.reload();
  await expect(categories(page).getByRole('row').nth(1)).toContainText('المأكولات البحرية');
  await expect(rowOf(page, categories(page), 'الأغنام').getByText('2', { exact: true })).toBeVisible();
});

test('products: filters by status, store and category, the empty state, and the availability switch', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/products');
  await expect(products(page).getByText('ريب آي بقري طازج')).toBeVisible();
  await expect(products(page).getByText('89.00 ر.س')).toBeVisible();

  await page.getByLabel('حالة المنتج').selectOption('pending_review');
  await page.getByLabel('المتجر', { exact: true }).selectOption({ label: 'ذبائح الرياض' });
  await expect(page.getByText('الحالة: قيد المراجعة')).toBeVisible();
  await expect(page.getByText('المتجر: ذبائح الرياض')).toBeVisible();
  await expect(products(page).getByText('فخذ غنم نعيمي')).toBeVisible();
  await expect(products(page).getByText('ريب آي بقري طازج')).toHaveCount(0);

  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'الدواجن' });
  await expect(page.getByText('لا توجد منتجات مطابقة')).toBeVisible();
  await page.getByRole('button', { name: 'مسح التصفية' }).click();
  await expect(products(page).getByText('ريب آي بقري طازج')).toBeVisible();

  // JAZLA's own product: switched off at once, the badge follows; other vendors' products have no switch.
  const ribs = page.getByRole('switch', { name: 'ضلوع غنم للمشاوي متاح للطلب' });
  await expect(ribs).toHaveAttribute('aria-checked', 'true');
  await ribs.click();
  await expect(page.getByRole('status').getByText('أُوقف طلب ضلوع غنم للمشاوي')).toBeVisible();
  await expect(ribs).toHaveAttribute('aria-checked', 'false');
  await expect(rowOf(page, products(page), 'ضلوع غنم للمشاوي').getByText('غير متاح')).toBeVisible();
  await expect(page.getByRole('switch', { name: 'ريب آي بقري طازج متاح للطلب' })).toHaveCount(0);
  await ribs.click();
  await expect(ribs).toHaveAttribute('aria-checked', 'true');
});

test('exit criteria: a JAZLA carcass with 3 sizes, cuts (one priced), packaging with an incompatible pair and exclusions', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/products');
  await page.getByRole('link', { name: 'إضافة منتج' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'منتج جديد' })).toBeVisible();

  await page.getByLabel('اسم المنتج', { exact: true }).fill('ذبيحة نعيمي كاملة');
  await page.getByLabel('اسم المنتج بالإنجليزية').fill('Whole Naimi carcass');
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'الأغنام' });
  await page.getByLabel('نوع اللحم').selectOption({ label: 'نعيمي' });
  await page.locator('input[type=file]').setInputFiles({ name: 'carcass.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'صورة الغلاف، 1 من 1' })).toBeVisible();

  const sizes: [string, string, string, string][] = [['صغير', 'Small', '8000', '950'], ['وسط', 'Medium', '12000', '1250'], ['كبير', 'Large', '16000', '1550']];
  for (const [i, [ar, en, grams, price]] of sizes.entries()) {
    await page.getByRole('button', { name: 'إضافة حجم' }).click();
    await page.getByLabel(`وصف الحجم ${i + 1}`, { exact: true }).fill(ar);
    await page.getByLabel(`وصف الحجم ${i + 1} بالإنجليزية`).fill(en);
    await page.getByLabel(`وزن الحجم ${i + 1} بالجرام`).fill(grams);
    await page.getByLabel(`سعر الحجم ${i + 1}`).fill(price);
  }

  await page.getByRole('button', { name: 'قطعة كاملة', exact: true }).click();
  await page.getByRole('button', { name: 'مكعبات', exact: true }).click();
  await page.getByLabel('السعر الإضافي لـمكعبات').fill('25');
  await page.getByLabel('كيس مفرّغ', { exact: true }).check();
  await page.getByLabel('علبة مبرّدة', { exact: true }).check();
  await page.getByLabel('السعر الإضافي لـعلبة مبرّدة').fill('3');
  await page.getByRole('button', { name: 'بدون دهون زائدة' }).click();
  await page.getByRole('button', { name: 'بدون جلد' }).click();

  // The incompatible combination: a whole piece cannot go in a chilled tray (a global rule, from the matrix).
  await page.getByRole('button', { name: 'قطعة كاملة مع علبة مبرّدة: متوافق' }).click();
  await expect(page.getByRole('button', { name: 'قطعة كاملة مع علبة مبرّدة: غير متوافق' })).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'حفظ كمسودة' }).click();
  await expect(page.getByRole('status').getByText('تم حفظ ذبيحة نعيمي كاملة')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/catalog\/products\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { level: 1, name: 'ذبيحة نعيمي كاملة' })).toBeVisible();

  // Publishing a product that offers the forbidden pair is refused by the API: the form says why.
  await page.getByRole('button', { name: 'حفظ ونشر' }).click();
  await expect(page.getByText('يقدّم المنتج تقطيعًا مع تغليف غير متوافق')).toBeVisible();

  // Reloaded from the API: everything was saved.
  await page.reload();
  await expect(page.getByLabel('سعر الحجم 3')).toHaveValue('1550.00');
  await expect(page.getByLabel('السعر الإضافي لـمكعبات')).toHaveValue('25.00');
  await expect(page.getByRole('button', { name: 'بدون جلد' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/admin/catalog/products');
  await expect(rowOf(page, products(page), 'ذبيحة نعيمي كاملة').getByText('مسودة')).toBeVisible();
  await expect(rowOf(page, products(page), 'ذبيحة نعيمي كاملة').getByText('950.00 ر.س')).toBeVisible();
});

test('validation: the form checks what the frame shows, and the API errors land on their fields', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/products/new');
  await page.getByRole('button', { name: 'إضافة حجم' }).click();
  await page.getByRole('button', { name: 'حفظ كمسودة' }).click();
  await expect(page.getByText('اسم المنتج مطلوب')).toBeVisible();
  await expect(page.getByLabel('سعر الحجم 1')).toHaveAttribute('placeholder', 'السعر مطلوب');

  await page.getByLabel('اسم المنتج', { exact: true }).fill('ذبيحة حري');
  await page.getByLabel('اسم المنتج بالإنجليزية').fill('H'); // the API wants 2 to 100 characters
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'الأغنام' });
  await page.getByLabel('وزن الحجم 1 بالجرام').fill('9000');
  await page.getByLabel('سعر الحجم 1').fill('900');
  await page.getByRole('button', { name: 'حفظ كمسودة' }).click();
  const en = page.getByLabel('اسم المنتج بالإنجليزية');
  await expect(en).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('القيمة أقل من الحد الأدنى')).toBeVisible(); // VALIDATION_FAILED name.en, from the route/API
  await expect(page.getByLabel('اسم المنتج', { exact: true })).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/\/products\/new$/);
});

test('an admin without the permission sees the not-allowed states, still signed in', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await context.addCookies([{ url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/catalog/categories');
  await expect(page.getByText('ليست لديك صلاحية لإدارة التصنيفات')).toBeVisible();
  await page.goto('/admin/catalog/products');
  await expect(page.getByText('ليست لديك صلاحية لعرض المنتجات')).toBeVisible();
  await page.goto('/admin/catalog/products/new');
  await expect(page.getByText('ليست لديك صلاحية لإدارة المنتجات')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/catalog\/products\/new$/);
});

test('English mirrors the products list; the side nav opens the catalog', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/en/admin');
  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page).toHaveURL(/\/en\/admin\/catalog\/products$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('table', { name: 'Products' }).getByText('Fresh beef ribeye')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Products' }).getByText('SAR 89.00')).toBeVisible();
});
