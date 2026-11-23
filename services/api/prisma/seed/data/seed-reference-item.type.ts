/**
 * An entry of an admin list (meat type, cutting style, "without" item) the seed
 * creates. `key` is stable: the row's id is derived from it (seedId), and products
 * name their entries by it.
 */
export type SeedReferenceItem = Readonly<{
  key: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}>;
