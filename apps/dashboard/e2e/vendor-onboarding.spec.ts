import { expect, test, type Page } from '@playwright/test';
import { signInAs } from './helpers';

// Mock (src/features/vendor-onboarding/backend.ts): any phone signs in as a customer with the code = its last digit × 6.
// 0500000005 has a rejected application, 0500000006 an approved one; a fresh random phone has none.

async function signInAsApplicant(page: Page, phone: string) {
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
  await page.getByLabel('رقم الجوال').fill(phone);
  await page.getByRole('button', { name: 'إرسال الرمز' }).click();
  await page.getByLabel('رمز التحقق').fill(phone.slice(-1).repeat(6));
  await page.getByRole('button', { name: 'تأكيد' }).click();
}

const pdf = (name: string) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 mock') });

test('a full application, from the phone to the pending status, survives a session that ends mid-way', async ({ page, context }) => {
  const phone = `05${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}3`;
  await page.goto('/vendor/apply');
  await signInAsApplicant(page, phone);

  // 1. Business details: the client checks mirror the API.
  await expect(page.getByRole('heading', { level: 1, name: 'بيانات المنشأة' })).toBeVisible();
  await page.getByLabel('اسم المتجر بالعربية').fill('ملحمة الاختبار');
  await page.getByLabel('اسم المتجر بالإنجليزية').fill('Test Butchery');
  await page.getByLabel('رقم السجل التجاري').fill('10104582');
  await page.getByLabel('الرقم الضريبي (اختياري)').fill('210123456700003');
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'صحّح الحقول المظلّلة بالأحمر ثم تابع.' })).toBeVisible();
  await expect(page.getByText('السجل التجاري 10 أرقام')).toBeVisible();
  await page.getByLabel('رقم السجل التجاري').fill('1010458216');
  await page.getByLabel('الرقم الضريبي (اختياري)').fill('310123456700003');
  await page.getByLabel('المدينة').fill('الرياض');
  await page.getByRole('button', { name: 'التالي' }).click();

  // 2. Documents: presigned uploads (ticket, storage, confirm).
  await expect(page.getByRole('heading', { level: 1, name: 'المستندات' })).toBeVisible();
  const files = page.locator('input[type=file]');
  await files.nth(0).setInputFiles(pdf('cr.pdf'));
  await files.nth(1).setInputFiles(pdf('health.pdf'));
  await expect(page.getByText('health.pdf · 1 كيلوبايت')).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByText('ارفع هذا المستند')).toBeVisible(); // the facility photo is required too
  await files.nth(2).setInputFiles({ name: 'front.png', mimeType: 'image/png', buffer: Buffer.from('png') });
  await expect(page.getByText('front.png · 1 كيلوبايت')).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();

  // 3. Bank account: Saudi IBAN with its checksum; the bank is read from it.
  await expect(page.getByRole('heading', { level: 1, name: 'الحساب البنكي' })).toBeVisible();
  await page.getByLabel('اسم صاحب الحساب').fill('مؤسسة الاختبار');
  await page.getByLabel('رقم الآيبان (IBAN)').fill('SA03 8000 0000 6080 1016 7518');
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByText('آيبان سعودي غير صحيح. يبدأ بـ SA ثم 22 خانة')).toBeVisible();
  await page.getByLabel('رقم الآيبان (IBAN)').fill('sa0380000000608010167519');
  await expect(page.getByLabel('البنك')).toHaveValue('مصرف الراجحي');

  // The session ends here: signing in again brings the draft back.
  await context.clearCookies();
  await page.reload();
  await signInAsApplicant(page, phone);
  await expect(page.getByText('استعدنا ما كتبته سابقًا، عدا رقم الآيبان الذي نطلبه مرة أخرى. راجعه ثم تابع.')).toBeVisible();
  // The IBAN is never kept in a draft: it is asked for again.
  await expect(page.getByLabel('اسم صاحب الحساب')).toHaveValue('مؤسسة الاختبار');
  await expect(page.getByLabel('رقم الآيبان (IBAN)')).toHaveValue('');
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage }) + JSON.stringify({ ...localStorage }))).not.toContain('6080');
  await page.getByLabel('رقم الآيبان (IBAN)').fill('SA0380000000608010167519');
  await page.getByRole('button', { name: 'السابق' }).click();
  await expect(page.getByText('cr.pdf · 1 كيلوبايت')).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'التالي' }).click();

  // 4. Location: a pin is required.
  await expect(page.getByRole('heading', { level: 1, name: 'موقع المنشأة' })).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'حرّك الدبوس إلى باب المنشأة على الخريطة' })).toBeVisible();
  const mapBox = page.getByRole('application', { name: 'خريطة موقع المنشأة' });
  await expect(mapBox).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  const map = (await mapBox.boundingBox())!;
  await page.mouse.click(map.x + map.width / 2 + 40, map.y + map.height / 2 + 30);
  await page.getByRole('button', { name: 'التالي' }).click();

  // 5. Review and submit.
  await expect(page.getByRole('heading', { level: 1, name: 'الصور والمراجعة' })).toBeVisible();
  await expect(page.getByText('3 من 3 مطلوبة، 0 اختياري')).toBeVisible();
  await expect(page.getByText(/مصرف الراجحي · .SA•• •••• 7519./)).toBeVisible();
  await page.getByRole('button', { name: 'إرسال الطلب' }).click();
  await expect(page.getByText('وافق على الإقرار لإرسال الطلب')).toBeVisible();
  await page.getByLabel('أقرّ بصحة البيانات وأوافق على شروط التجّار في جزلة').check();
  await page.getByRole('button', { name: 'إرسال الطلب' }).click();

  await expect(page).toHaveURL(/\/vendor\/application$/);
  await expect(page.getByRole('heading', { name: 'استلمنا طلبك' })).toBeVisible();
  await expect(page.getByText('قيد المراجعة', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'عرض الطلب المرسل' }).click();
  await expect(page.getByText('ملحمة الاختبار · Test Butchery')).toBeVisible();
  // A pending application cannot be sent twice: the form sends back to the status.
  await page.goto('/vendor/apply');
  await expect(page).toHaveURL(/\/vendor\/application$/);
  // The admin review (same mock store) lists it under «pending review»; its uploaded PDF opens from a signed link.
  await signInAs(context, ['admin']);
  await page.goto('/admin/vendors');
  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await page.getByRole('table', { name: 'المتاجر' }).getByRole('link', { name: 'ملحمة الاختبار', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'مراجعة: ملحمة الاختبار' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'فتح الملف' })).toBeVisible();
});

test('a draft is never shown to another applicant on the same device', async ({ page, context }) => {
  const first = `05${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}6`;
  await page.goto('/vendor/apply');
  await signInAsApplicant(page, first);
  await page.getByLabel('اسم المتجر بالعربية').fill('مسودة المتقدم الأول');
  await page.getByRole('button', { name: 'حفظ والإكمال لاحقًا' }).click();

  // The session ends, and someone else signs in on the same tab, with a phone that masks the same (+966 5•• ••• xyz):
  // drafts belong to the user id, not to the shown phone.
  await context.clearCookies();
  await page.reload();
  await signInAsApplicant(page, `05${String(Math.floor(Math.random() * 1e5)).padStart(5, '0')}${first.slice(-3)}`);
  await expect(page.getByRole('heading', { level: 1, name: 'بيانات المنشأة' })).toBeVisible();
  await expect(page.getByLabel('اسم المتجر بالعربية')).toHaveValue('');
  await expect(page.getByText(/استعدنا ما كتبته/)).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify({ ...sessionStorage }) + JSON.stringify({ ...localStorage }))).not.toContain('مسودة المتقدم الأول');
});

test('signing out of the application clears the drafts on the device', async ({ page }) => {
  const phone = `05${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}8`;
  await page.goto('/vendor/apply');
  await signInAsApplicant(page, phone);
  await page.getByLabel('اسم المتجر بالعربية').fill('مسودة قبل الخروج');
  await page.getByRole('button', { name: 'حفظ والإكمال لاحقًا' }).click();
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.length + localStorage.length)).toBe(0);
});

test('a rejected application shows the reason and can be sent again with the earlier details', async ({ page }) => {
  await page.goto('/vendor/application');
  await signInAsApplicant(page, '0500000005');
  await expect(page).toHaveURL(/\/vendor\/application$/);
  await expect(page.getByRole('heading', { name: 'لم نتمكن من قبول الطلب' })).toBeVisible();
  await expect(page.getByText('صورة الشهادة الصحية غير واضحة، وتاريخ انتهائها لا يظهر. ارفع نسخة سارية وواضحة.')).toBeVisible();
  await page.getByRole('link', { name: 'تعديل الطلب وإعادة الإرسال' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'بيانات المنشأة' })).toBeVisible();
  await expect(page.getByLabel('اسم المتجر بالعربية')).toHaveValue('ملحمة النخبة');
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page.getByText('ملف من طلبك السابق')).toHaveCount(3);
  // Signing out of the customer session goes back to the application's sign-in.
  await page.goto('/vendor/application');
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
});

test('the approved status leads to the vendor sign-in; a customer session never opens a staff panel', async ({ page }) => {
  await page.goto('/vendor/application');
  await signInAsApplicant(page, '0500000006');
  await expect(page.getByRole('heading', { name: 'تم قبول متجرك في جزلة' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'الدخول إلى لوحة التاجر' })).toHaveAttribute('href', '/login?panel=vendor');
  await page.goto('/vendor');
  await expect(page).toHaveURL(/\/login\?panel=vendor/);
});

test('store profile: validation, save, and the suspended store', async ({ page, context }) => {
  await signInAs(context, ['vendor']);
  await page.goto('/vendor/store');
  await expect(page.getByRole('heading', { level: 1, name: 'ملف المتجر' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).locator('[aria-current=page]')).toHaveText('ملف المتجر');
  await expect(page.getByLabel('اسم المتجر', { exact: true })).toHaveValue('مجازر الفلاح');

  const description = `مجزر عائلي ${Date.now()}`;
  await page.getByLabel('وصف المتجر', { exact: true }).fill(description);
  await page.getByLabel('البريد الإلكتروني').fill('orders@');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await expect(page.getByText('صيغة البريد غير صحيحة')).toBeVisible();
  await page.getByLabel('البريد الإلكتروني').fill('orders@alfalah-meat.sa');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'حفظنا التغييرات.' })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('وصف المتجر', { exact: true })).toHaveValue(description);

  // The mock answers VENDOR_SUSPENDED for this email: the page turns read-only, and the session is over.
  await page.getByLabel('البريد الإلكتروني').fill('suspended@example.com');
  await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'متجرك موقوف مؤقتًا' })).toBeVisible();
  await expect(page.getByLabel('وصف المتجر', { exact: true })).toBeDisabled();
  expect((await context.cookies()).find((c) => c.name === 'jz_rt_vendor')).toBeUndefined();
});

test('after the idle timeout, a remaining customer refresh token is ended and cleared', async ({ page, context }) => {
  await context.addCookies([{ name: 'jz_rt_customer', value: 'mock-rt-customer-500000001-1', url: `http://localhost:${process.env.PORT ?? 3001}`, httpOnly: true }]);
  await page.goto('/vendor/apply');
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === 'jz_rt_customer')).toBeUndefined();
});
