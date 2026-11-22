import { expect, test } from '@playwright/test';
import { ADMIN, APPLICANT, PNG, RUN, pdf, signIn, signInTo, toast } from './helpers';

// VND-DSH-1 and VND-DSH-2 against the real API: a new applicant applies with uploaded documents (presigned POST to the
// storage), first with a registration number a seeded store holds (VENDOR_CR_EXISTS on the field), then an admin
// approves the application with a 12.5% commission, sent as 1250 basis points.
// Needs a freshly seeded API: the applicant phone has no application yet.
const NAME = `ملحمة القبول ${RUN}`;
const NAME_EN = `Acceptance Butchery ${RUN}`;

test.describe.configure({ mode: 'serial' });

test('a new applicant sends a full application with documents', async ({ page }) => {
  await page.goto('/vendor/apply');
  await expect(page.getByRole('heading', { name: 'انضم كتاجر' })).toBeVisible();
  await signIn(page, APPLICANT);
  await expect(page.getByRole('heading', { level: 1, name: 'بيانات المنشأة' })).toBeVisible({ timeout: 15_000 });

  await page.getByLabel('اسم المتجر بالعربية').fill(NAME);
  await page.getByLabel('اسم المتجر بالإنجليزية').fill(NAME_EN);
  await page.getByLabel('رقم السجل التجاري').fill('1010000101'); // the seeded ملحمة النخبة's: refused at submit
  await page.getByLabel('الرقم الضريبي (اختياري)').fill('310123456700003');
  await page.getByLabel('المدينة').fill('الرياض');
  await page.getByRole('button', { name: 'التالي' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'المستندات' })).toBeVisible();
  const files = page.locator('input[type=file]');
  await files.nth(0).setInputFiles(pdf('cr.pdf'));
  await expect(page.getByText(/cr\.pdf · /)).toBeVisible({ timeout: 15_000 });
  await files.nth(1).setInputFiles(pdf('health.pdf'));
  await expect(page.getByText(/health\.pdf · /)).toBeVisible({ timeout: 15_000 });
  await files.nth(2).setInputFiles({ name: 'front.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByText(/front\.png · /)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'التالي' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'الحساب البنكي' })).toBeVisible();
  await page.getByLabel('اسم صاحب الحساب').fill('مؤسسة القبول');
  await page.getByLabel('رقم الآيبان (IBAN)').fill('SA0380000000608010167519');
  await page.getByRole('button', { name: 'التالي' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'موقع المنشأة' })).toBeVisible();
  const mapBox = page.getByRole('application', { name: 'خريطة موقع المنشأة' });
  await expect(mapBox).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  const map = (await mapBox.boundingBox())!;
  await page.mouse.click(map.x + map.width / 2 + 40, map.y + map.height / 2 + 30);
  await page.getByRole('button', { name: 'التالي' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'الصور والمراجعة' })).toBeVisible();
  await page.getByLabel('أقرّ بصحة البيانات وأوافق على شروط التجّار في جزلة').check();
  await page.getByRole('button', { name: 'إرسال الطلب' }).click();

  // VENDOR_CR_EXISTS: the wizard goes back to the business step with the error on the registration number field.
  await expect(page.getByRole('heading', { level: 1, name: 'بيانات المنشأة' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('يوجد متجر مسجّل في جزلة بهذا السجل التجاري')).toBeVisible();
  await page.getByLabel('رقم السجل التجاري').fill('1010458216');
  for (const step of ['المستندات', 'الحساب البنكي', 'موقع المنشأة', 'الصور والمراجعة']) {
    await page.getByRole('button', { name: 'التالي' }).click();
    await expect(page.getByRole('heading', { level: 1, name: step })).toBeVisible();
  }
  await page.getByLabel('أقرّ بصحة البيانات وأوافق على شروط التجّار في جزلة').check();
  await page.getByRole('button', { name: 'إرسال الطلب' }).click();

  await expect(page).toHaveURL(/\/vendor\/application$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'استلمنا طلبك' })).toBeVisible();
  // The draft is gone once the application is sent.
  expect(await page.evaluate(() => sessionStorage.length + localStorage.length)).toBe(0);
});

test('an admin approves it with a 12.5% commission: an active vendor with 1250 basis points', async ({ page }) => {
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/vendors');
  await page.getByRole('tab', { name: 'قيد المراجعة' }).click();
  await page.getByRole('table', { name: 'المتاجر' }).getByRole('link', { name: NAME, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: `مراجعة: ${NAME}` })).toBeVisible();

  await page.getByRole('button', { name: 'اعتماد المتجر' }).click();
  const dialog = page.getByRole('dialog', { name: `اعتماد ${NAME}` });
  await dialog.getByLabel('نسبة العمولة (%)').fill('12.5');
  await dialog.getByRole('button', { name: 'اعتماد وتفعيل' }).click();
  await toast(page, `تم اعتماد ${NAME} وتفعيله`);
  await expect(page.getByRole('heading', { name: 'المتجر نشط' })).toBeVisible();

  // Read back from the API: the active vendor, with commissionBasisPoints 1250 shown as 12.5%.
  await page.goto('/admin/vendors');
  const row = page.getByRole('table', { name: 'المتاجر' }).getByRole('row').filter({ has: page.getByRole('link', { name: NAME, exact: true }) });
  await expect(row.getByText('نشط')).toBeVisible();
  await expect(row.getByText('12.5%')).toBeVisible();
  // And as the API answers it (through the dashboard's route, with the admin session): 1250 basis points.
  const res = await page.request.get(`/api/admin/vendors?status=active&q=${encodeURIComponent(NAME_EN)}`);
  const body = await res.text();
  expect(res.ok(), body).toBe(true);
  const vendor = (JSON.parse(body) as { items: { name: { en: string }; status: string; commissionBasisPoints: number }[] }).items.find((v) => v.name.en === NAME_EN);
  expect(vendor, body).toMatchObject({ status: 'active', commissionBasisPoints: 1250 });
});
