import type { SeedCategory } from './data/seed-category.type';
import { encodeSolidPng } from './encode-solid-png';
import type { SeedFile } from './seed-file.type';
import { seedId } from './seed-id';

/** The colours of the category placeholders, by display order (repeating). */
const CATEGORY_COLORS = ['#7A2E41', '#8E4C21', '#6B4433', '#A0522D', '#8C2D23'];

/**
 * The placeholder image of a seeded category: a 320x320 PNG in a colour picked by its
 * display order, a `catalog.category-image` upload (public bucket) owned by the admin
 * development account, as if that admin had uploaded it.
 */
export function categoryImageFile(
  category: SeedCategory,
  ownerId: string,
): SeedFile {
  const color = CATEGORY_COLORS[category.sortOrder % CATEGORY_COLORS.length];
  if (color === undefined) {
    throw new Error(`No image colour for the category ${category.key}`);
  }
  return {
    id: seedId(`media:category:${category.key}`),
    purpose: 'catalog.category-image',
    contentType: 'image/png',
    bytes: encodeSolidPng(320, 320, color),
    ownerId,
    fileName: `${category.key}.png`,
  };
}
