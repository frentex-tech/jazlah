import { expect, test, type Locator, type Page } from '@playwright/test';
import { follow, signInAs } from './helpers';

// Mock (src/features/catalog/vendor-backend.ts on the admin catalog store): the vendor session is «مجازر الفلاح»
// (ريب آي بقري طازج published, تي بون بقري rejected, ستيك مخلّل بالثوم draft). The queue starts with فخذ غنم نعيمي
// (new, ذبائح الرياض) and an edit of كتف غنم للتحمير. One server and one mock store for the whole run.

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const BASE_URL = `http://localhost:${process.env.PORT ?? 3001}`;
const mine = (page: Page) => page.getByRole('table', { name: 'منتجاتي' });
const queue = (page: Page) => page.getByRole('table', { name: 'قيد المراجعة' });
const rowOf = (page: Page, table: Locator, name: string) => table.getByRole('row').filter({ has: page.getByText(name, { exact: true }) });
const toast = (page: Page, text: string) => expect(page.getByRole('status').getByText(text)).toBeVisible();
const badge = (page: Page) => page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: /المنتجات/ });
/** The pending count on «المنتجات» (0 without a badge), once the page has read it. */
const pendingCount = async (page: Page) => Number((await badge(page).innerText()).match(/\d+/)?.[0] ?? 0);
// Names unique to this run, so a re-run on the same server (reuseExistingServer) finds only its own products.
const RUN = Date.now().toString(36).slice(-4);

test('my products: status and availability badges, the rejected notice, filters and the availability switch', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  await page.goto('/vendor/products');
  await expect(page.getByRole('heading', { level: 1, name: 'منتجاتي' })).toBeVisible();
  // ريب آي is renamed by the published-product test below: matched by its start.
  const ribeye = mine(page).getByRole('row').filter({ has: page.getByText(/^ريب آي بقري طازج/) }).first();
  await expect(ribeye.getByText('منشور')).toBeVisible();
  await expect(ribeye.getByText(/^(متاح|نفد المخزون)$/)).toBeVisible();
  await expect(rowOf(page, mine(page), 'تي بون بقري').getByText('مرفوض')).toBeVisible();
  await expect(rowOf(page, mine(page), 'ستيك مخلّل بالثوم').getByText('غير معروض')).toBeVisible();
  await expect(mine(page).getByText('فخذ غنم نعيمي')).toHaveCount(0); // another store's
  await expect(page.getByText('منتج مرفوض بانتظار تعديلك. افتح المنتج لقراءة ملاحظات المراجعة.')).toBeVisible();

  await page.getByLabel('حالة المنتج').selectOption('rejected');
  await expect(page.getByText('الحالة: مرفوض')).toBeVisible();
  await expect(mine(page).getByText('تي بون بقري')).toBeVisible();
  await expect(mine(page).getByText(/^ريب آي بقري طازج/)).toHaveCount(0);
  await page.getByLabel('التوفر', { exact: true }).selectOption('out');
  await expect(page.getByText('لا توجد منتجات مطابقة')).toBeVisible();
  await page.getByRole('button', { name: 'مسح التصفية' }).click();

  // Out of stock and back on the draft, at once and with no review.
  const steak = rowOf(page, mine(page), 'ستيك مخلّل بالثوم');
  await page.getByRole('button', { name: 'إجراءات ستيك مخلّل بالثوم' }).click();
  await page.getByRole('button', { name: 'إيقاف الطلب' }).click();
  await toast(page, 'أُوقف طلب ستيك مخلّل بالثوم');
  await expect(steak.getByText('نفد المخزون')).toBeVisible();
  await expect(steak.getByText('مسودة')).toBeVisible();
  await page.getByRole('button', { name: 'إجراءات ستيك مخلّل بالثوم' }).click();
  await page.getByRole('button', { name: 'إتاحة للطلب' }).click();
  await expect(steak.getByText('غير معروض')).toBeVisible();
});

test('review cycle: submit, rejected with a reason, notes, resubmit, approved', async ({ page, context }) => {
  await signInAs(context, ['vendor', 'admin']);
  await page.goto('/admin/catalog/review');
  await expect(queue(page).getByRole('row').nth(1)).toBeVisible();
  await expect(badge(page)).toContainText(/\d/);
  const before = await pendingCount(page);
  await page.goto('/vendor/products');
  await expect(mine(page).getByText('ستيك مخلّل بالثوم')).toBeVisible(); // hydrated before the click
  await follow(page, page.getByRole('link', { name: 'إضافة منتج' }), /\/vendor\/products\/new$/);
  await page.getByLabel('اسم المنتج', { exact: true }).fill(`فخذ عجل طازج ${RUN}`);
  await page.getByLabel('اسم المنتج بالإنجليزية').fill(`Fresh veal leg ${RUN}`);
  await page.getByLabel('التصنيف', { exact: true }).selectOption({ label: 'الأبقار' });
  await page.locator('input[type=file]').setInputFiles({ name: 'veal.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('button', { name: 'صورة الغلاف، 1 من 1' })).toBeVisible();
  await page.getByRole('button', { name: 'إضافة حجم' }).click();
  await page.getByLabel('وزن الحجم 1 بالجرام').fill('1000');
  await page.getByLabel('سعر الحجم 1').fill('120');
  await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
  await toast(page, `أُرسل فخذ عجل طازج ${RUN} للمراجعة`);
  await expect(page).toHaveURL(/\/vendor\/products\/[0-9a-f-]{36}$/);
  // Under review: read-only.
  await expect(page.getByText('المنتج قيد المراجعة ولا يمكن تعديله')).toBeVisible();
  await expect(page.getByLabel('اسم المنتج', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'إرسال للمراجعة' })).toHaveCount(0);
  const productUrl = page.url();

  // The admin's queue: new products and edits, with the pending count on «المنتجات».
  await page.goto('/admin/catalog/review');
  await expect(rowOf(page, queue(page), `فخذ عجل طازج ${RUN}`).getByText('منتج جديد')).toBeVisible();
  await expect(rowOf(page, queue(page), 'كتف غنم للتحمير').getByText('تعديل منتج')).toBeVisible();
  await expect(badge(page)).toContainText(String(before + 1));
  await page.getByRole('button', { name: `مراجعة فخذ عجل طازج ${RUN}` }).click();
  const dialog = page.getByRole('dialog', { name: `مراجعة: فخذ عجل طازج ${RUN}` });
  await expect(dialog.getByText('مجازر الفلاح')).toBeVisible();
  await expect(dialog.getByText('120.00 ر.س')).toBeVisible();
  await dialog.getByRole('button', { name: 'رفض مع السبب' }).click();
  await expect(dialog.getByText('اكتب سبب الرفض ليقرأه البائع.')).toBeVisible();
  await dialog.getByRole('button', { name: 'صورة غير واضحة' }).click();
  await expect(dialog.getByLabel('سبب الرفض (يظهر للبائع)')).toHaveValue('صورة المنتج غير واضحة، التقط صورة بإضاءة أفضل');
  await dialog.getByRole('button', { name: 'رفض مع السبب' }).click();
  await toast(page, `رُفض فخذ عجل طازج ${RUN} وأُرسل السبب للبائع`);
  await expect(queue(page).getByText(`فخذ عجل طازج ${RUN}`)).toHaveCount(0);
  await expect(badge(page)).toContainText(String(before));

  // The vendor reads the notes, edits and sends it again.
  await page.goto('/vendor/products');
  await expect(page.getByText('بانتظار تعديلك', { exact: false })).toBeVisible();
  await rowOf(page, mine(page), `فخذ عجل طازج ${RUN}`).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: 'ملاحظات المراجعة' })).toBeVisible();
  await expect(page.getByText('صورة المنتج غير واضحة، التقط صورة بإضاءة أفضل')).toBeVisible();
  await page.getByRole('link', { name: 'تعديل وإعادة الإرسال' }).click();
  await expect(page).toHaveURL(productUrl);
  await page.getByLabel('الوصف', { exact: true }).fill('فخذ عجل بلدي طازج يُذبح يوميًا');
  await page.getByRole('button', { name: 'إرسال للمراجعة' }).click();
  await toast(page, `أُرسل فخذ عجل طازج ${RUN} للمراجعة`);
  await page.goto(`${productUrl}/review`);
  await expect(page.getByText('أُرسل المنتج للمراجعة بعد تعديل الملاحظات.', { exact: false })).toBeVisible();

  // Approved: out of the queue, published.
  await page.goto('/admin/catalog/review');
  await page.getByRole('button', { name: `مراجعة فخذ عجل طازج ${RUN}` }).click();
  await page.getByRole('dialog', { name: `مراجعة: فخذ عجل طازج ${RUN}` }).getByRole('button', { name: 'اعتماد ونشر' }).click();
  await toast(page, `اعتُمد فخذ عجل طازج ${RUN} ونُشر`);
  await expect(queue(page).getByText(`فخذ عجل طازج ${RUN}`)).toHaveCount(0);
  await page.getByRole('tab', { name: 'معتمدة' }).click();
  await expect(page.getByRole('table', { name: 'معتمدة' }).getByText(`فخذ عجل طازج ${RUN}`)).toBeVisible();
  await page.goto(`${productUrl}/review`);
  await expect(page.getByText('تمت الموافقة ونُشر المنتج في المتجر.')).toBeVisible();
  await page.goto('/vendor/products');
  await expect(rowOf(page, mine(page), `فخذ عجل طازج ${RUN}`).getByText('منشور')).toBeVisible();
});

test('a published product: a price applies at once, a name change warns and becomes an edit the admin approves', async ({ page, context }) => {
  await signInAs(context, ['vendor', 'admin']);
  await page.goto('/vendor/products/b1000000-0000-4000-8000-000000000001'); // ريب آي بقري طازج, published
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(/^ريب آي بقري طازج/);
  const liveName = (await heading.innerText()).trim(); // renamed by an earlier run on a reused server
  const warning = page.getByText('سيُعاد مراجعة المنتج', { exact: false });
  await page.getByLabel('سعر الحجم 1').fill('95');
  await expect(warning).toHaveCount(0);
  await page.getByLabel('اسم المنتج', { exact: true }).fill(`ريب آي بقري طازج ${RUN}`);
  await expect(warning).toBeVisible();
  await page.getByRole('button', { name: 'حفظ التعديلات' }).click();
  await toast(page, `أُرسل تعديل ${liveName} للمراجعة`);
  // The proposed edit stays in the form (no snap back to the live name), also after a reload.
  await expect(page.getByLabel('اسم المنتج', { exact: true })).toHaveValue(`ريب آي بقري طازج ${RUN}`);
  await expect(page.getByText('بانتظار المراجعة ويظهر هنا', { exact: false })).toBeVisible();
  await expect(warning).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('اسم المنتج', { exact: true })).toHaveValue(`ريب آي بقري طازج ${RUN}`);
  await expect(page.getByLabel('سعر الحجم 1')).toHaveValue('95.00');
  // A later price change applies at once and leaves the pending edit as it is.
  await page.getByLabel('سعر الحجم 1').fill('97');
  await expect(warning).toHaveCount(0);
  await page.getByRole('button', { name: 'حفظ التعديلات' }).click();
  await toast(page, `تم حفظ ${liveName}`);
  // The live product: the new price already, the old name until the edit is approved.
  await page.goto('/vendor/products');
  await expect(rowOf(page, mine(page), liveName).getByText('97.00 ر.س')).toBeVisible();

  await page.goto('/admin/catalog/review');
  // The queue row names the live product (GET /v1/admin/review-queue); the dialog shows the proposed edit.
  const row = rowOf(page, queue(page), liveName);
  await expect(row.getByText('تعديل منتج')).toBeVisible();
  await page.getByRole('button', { name: `مراجعة ${liveName}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `مراجعة: ريب آي بقري طازج ${RUN}` });
  await expect(dialog.getByText('الاسم والوصف')).toBeVisible();
  // What approval makes live: the live price (not the request's 95.00) and the cuts by name.
  await expect(dialog.getByText('97.00 ر.س')).toBeVisible();
  await expect(dialog.getByText('تقطيع شرائح، مكعبات')).toBeVisible();
  await dialog.getByRole('button', { name: 'اعتماد ونشر' }).click();
  await toast(page, `اعتُمد ريب آي بقري طازج ${RUN} ونُشر`);
  await expect(queue(page).getByRole('button', { name: `مراجعة ${liveName}`, exact: true })).toHaveCount(0);

  await page.goto('/vendor/products');
  await expect(rowOf(page, mine(page), `ريب آي بقري طازج ${RUN}`).getByText('منشور')).toBeVisible();
});

test('the review queue: new products and edits in one list, filtered by kind and by store', async ({ page, context }) => {
  await signInAs(context, ['admin']);
  await page.goto('/admin/catalog/review');
  await expect(rowOf(page, queue(page), 'فخذ غنم نعيمي').getByText('منتج جديد')).toBeVisible();
  await expect(rowOf(page, queue(page), 'كتف غنم للتحمير').getByText('تعديل منتج')).toBeVisible();
  await page.getByLabel('نوع الطلب').selectOption({ label: 'تعديل منتج' });
  await expect(rowOf(page, queue(page), 'فخذ غنم نعيمي')).toHaveCount(0);
  await expect(rowOf(page, queue(page), 'كتف غنم للتحمير')).toHaveCount(1);
  await page.getByLabel('نوع الطلب').selectOption({ label: 'كل الأنواع' });
  await page.getByLabel('المتجر').selectOption({ label: 'مجازر الفلاح' });
  await expect(rowOf(page, queue(page), 'فخذ غنم نعيمي')).toHaveCount(0);
  await expect(rowOf(page, queue(page), 'كتف غنم للتحمير')).toHaveCount(0);
  await page.getByLabel('المتجر').selectOption({ label: 'ذبائح الرياض' });
  await expect(rowOf(page, queue(page), 'فخذ غنم نعيمي')).toHaveCount(1);
  await expect(rowOf(page, queue(page), 'كتف غنم للتحمير')).toHaveCount(1);
});

test('not allowed: a suspended store, and an admin without the review permission', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  await context.addCookies([{ url: BASE_URL, httpOnly: true, name: 'jz_at_vendor', value: 'mock-at-vendor-suspended' }]);
  await page.goto('/vendor/products');
  await expect(page.getByText('متجرك موقوف مؤقتًا')).toBeVisible();
  await expect(page.getByRole('link', { name: 'تسجيل الدخول' })).toHaveAttribute('href', /\/login\?panel=vendor&reason=suspended$/);

  await signInAs(context, ['admin']);
  await context.addCookies([{ url: BASE_URL, httpOnly: true, name: 'jz_at_admin', value: 'mock-at-admin-limited' }]);
  await page.goto('/admin/catalog/review');
  await expect(page.getByText('ليست لديك صلاحية لمراجعة المنتجات')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/catalog\/review$/);
});
