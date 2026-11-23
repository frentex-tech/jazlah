import { expect, test } from '@playwright/test';
import { ADMIN, RUN, apiGet, rowOf, signInTo, toast } from './helpers';

// CAT-DSH-1 against the real API: an admin adds a category, moves it to the top (one PATCH sortOrder per moved row),
// renames and hides it; each step is read back from GET /v1/public/categories (active ones, in display order).
const NAME = `الأسماك ${RUN}`;
const EN = `Fish ${RUN}`;
const RENAMED = `المأكولات البحرية ${RUN}`;
const publicNames = async () => (await apiGet<{ items: { name: { ar: string } }[] }>('/v1/public/categories')).items.map((c) => c.name.ar);

test('categories: add, reorder, rename and hide, as the public list shows', async ({ page }) => {
  await signInTo(page, 'admin', ADMIN);
  await page.goto('/admin/catalog/categories');
  const table = page.getByRole('table', { name: 'التصنيفات' });
  await expect(rowOf(page, table, 'ذبائح كاملة')).toHaveCount(1, { timeout: 15_000 });

  await page.getByRole('button', { name: 'إضافة تصنيف' }).click();
  const add = page.getByRole('dialog', { name: 'إضافة تصنيف' });
  await add.getByLabel('اسم التصنيف').fill(NAME);
  await add.getByLabel('الاسم بالإنجليزية').fill(EN);
  await add.getByRole('button', { name: 'حفظ' }).click();
  await toast(page, `تم حفظ تصنيف ${NAME}`);
  await expect(rowOf(page, table, NAME).getByText(EN)).toBeVisible();
  expect((await publicNames()).at(-1)).toBe(NAME); // added last

  // Reorder (the keyboard way of the drag): to the top, saved, and first for the customers too.
  await page.getByRole('button', { name: 'ترتيب التصنيفات' }).click();
  const up = page.getByRole('button', { name: `تقديم ${NAME}` });
  while (await up.isEnabled()) await up.click();
  await page.getByRole('button', { name: 'حفظ الترتيب' }).click();
  await toast(page, 'تم حفظ ترتيب التصنيفات');
  await page.reload();
  await expect(table.getByRole('row').nth(1)).toContainText(NAME);
  expect((await publicNames())[0]).toBe(NAME);

  // Rename and hide: left out of the public list.
  await page.getByRole('button', { name: `تعديل ${NAME}` }).click();
  const edit = page.getByRole('dialog', { name: `تعديل تصنيف ${NAME}` });
  await edit.getByLabel('اسم التصنيف').fill(RENAMED);
  await edit.getByRole('switch', { name: 'ظاهر في المتجر' }).click();
  await edit.getByRole('button', { name: 'حفظ' }).click();
  await toast(page, `تم حفظ تصنيف ${RENAMED}`);
  await page.reload();
  await expect(rowOf(page, table, RENAMED).getByText('مخفي')).toBeVisible();
  const names = await publicNames();
  expect(names).not.toContain(RENAMED);
  expect(names).not.toContain(NAME);
});
