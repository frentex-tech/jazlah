import { categoryImageFile } from './category-image-file';
import { SEED_CATEGORIES } from './data/categories.constants';
import { SEED_CUTTING_STYLES } from './data/cutting-styles.constants';
import { SEED_EXCLUSION_ITEMS } from './data/exclusion-items.constants';
import { SEED_INCOMPATIBILITIES } from './data/incompatibilities.constants';
import { SEED_MEAT_TYPES } from './data/meat-types.constants';
import type { SeedReferenceItem } from './data/seed-reference-item.type';
import { ensureSeedFile } from './ensure-seed-file';
import type { SeedContext } from './seed-context.type';
import { seedId } from './seed-id';
import { seedTime } from './seed-time';

/**
 * The admin lists (categories in their order, meat types, cutting styles, "without"
 * items) and the cutting and packaging rules. Each row has the id derived from its key
 * and is inserted only when that id (or, for a rule, its pair) is free: an entry an
 * admin renamed or deactivated stays as they left it. Each active category gets a
 * placeholder image uploaded by the admin development account (`adminId`), set when the
 * category is created; inactive ones have none.
 */
export async function seedReferenceLists(
  context: SeedContext,
  adminId: string,
): Promise<void> {
  const { db, tally } = context;
  const images = new Map<string, string>();
  for (const category of SEED_CATEGORIES.filter((item) => item.isActive)) {
    const file = categoryImageFile(category, adminId);
    await ensureSeedFile(context, file);
    images.set(category.key, file.id);
  }
  const row = (prefix: string, item: SeedReferenceItem, index: number) => ({
    id: seedId(`${prefix}:${item.key}`),
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    isActive: item.isActive,
    createdAt: seedTime(index),
  });

  const categories = await db.client.category.createMany({
    data: SEED_CATEGORIES.map((item, index) => ({
      ...row('category', item, index),
      sortOrder: item.sortOrder,
      imageMediaId: images.get(item.key) ?? null,
    })),
    skipDuplicates: true,
  });
  tally.add(
    'categories',
    categories.count,
    SEED_CATEGORIES.length - categories.count,
  );

  const meatTypes = await db.client.meatType.createMany({
    data: SEED_MEAT_TYPES.map((item, index) => row('meat-type', item, index)),
    skipDuplicates: true,
  });
  tally.add(
    'meat types',
    meatTypes.count,
    SEED_MEAT_TYPES.length - meatTypes.count,
  );

  const cuttingStyles = await db.client.cuttingStyle.createMany({
    data: SEED_CUTTING_STYLES.map((item, index) =>
      row('cutting-style', item, index),
    ),
    skipDuplicates: true,
  });
  tally.add(
    'cutting styles',
    cuttingStyles.count,
    SEED_CUTTING_STYLES.length - cuttingStyles.count,
  );

  const exclusionItems = await db.client.exclusionItem.createMany({
    data: SEED_EXCLUSION_ITEMS.map((item, index) =>
      row('exclusion-item', item, index),
    ),
    skipDuplicates: true,
  });
  tally.add(
    'exclusion items',
    exclusionItems.count,
    SEED_EXCLUSION_ITEMS.length - exclusionItems.count,
  );

  const rules = await db.client.cuttingPackagingIncompatibility.createMany({
    data: SEED_INCOMPATIBILITIES.map((rule, index) => ({
      id: seedId(`incompatibility:${rule.cuttingStyle}:${rule.packaging}`),
      cuttingStyleId: seedId(`cutting-style:${rule.cuttingStyle}`),
      packaging: rule.packaging,
      createdAt: seedTime(index),
    })),
    skipDuplicates: true,
  });
  tally.add(
    'cutting and packaging rules',
    rules.count,
    SEED_INCOMPATIBILITIES.length - rules.count,
  );
}
