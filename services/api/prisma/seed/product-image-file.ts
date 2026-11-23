import { IMAGE_PALETTES } from './data/image-palettes.constants';
import type { SeedProduct } from './data/seed-product.type';
import { encodeSolidPng } from './encode-solid-png';
import type { SeedFile } from './seed-file.type';
import { seedId } from './seed-id';

/**
 * The placeholder file of image `position` of a seeded product: a 480x360 PNG in colour
 * `position` of its meat type's palette, a `catalog.product-image` upload (public bucket)
 * owned by the vendor's user.
 */
export function productImageFile(
  product: SeedProduct,
  position: number,
  ownerId: string,
): SeedFile {
  const palette = IMAGE_PALETTES[product.meatType ?? 'mixed'] ?? [];
  const color = palette[position % palette.length];
  if (color === undefined) {
    throw new Error(`No image colours for the meat type of ${product.key}`);
  }
  return {
    id: seedId(`media:product:${product.key}:${position}`),
    purpose: 'catalog.product-image',
    contentType: 'image/png',
    bytes: encodeSolidPng(480, 360, color),
    ownerId,
    fileName: `${product.key}-${position + 1}.png`,
  };
}
