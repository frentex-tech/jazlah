// lint-rule: R20 conforms
import type { CatalogFinder } from './catalog-finder.type';

export async function loadProduct(
  finder: CatalogFinder,
  id: string,
): Promise<string> {
  const product = await finder.findUnique(id);
  if (product === null) {
    throw new Error('not found');
  }
  return product;
}
