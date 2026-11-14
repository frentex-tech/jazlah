// lint-rule: R20 violates
import type { CatalogFinder } from './catalog-finder.type';

export function loadProduct(
  finder: CatalogFinder,
  id: string,
): Promise<string> {
  return finder.findUniqueOrThrow(id);
}
