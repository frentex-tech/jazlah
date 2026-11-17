import type { SeedReferenceItem } from './seed-reference-item.type';

/** The seeded "without" items; intestines are inactive. */
export const SEED_EXCLUSION_ITEMS: readonly SeedReferenceItem[] = [
  { key: 'head', nameAr: 'الرأس', nameEn: 'Head', isActive: true },
  { key: 'tripe', nameAr: 'الكرشة', nameEn: 'Tripe', isActive: true },
  { key: 'trotters', nameAr: 'المقادم', nameEn: 'Trotters', isActive: true },
  { key: 'liver', nameAr: 'الكبدة', nameEn: 'Liver', isActive: true },
  { key: 'tail-fat', nameAr: 'الشحم', nameEn: 'Tail fat', isActive: true },
  {
    key: 'intestines',
    nameAr: 'المصران',
    nameEn: 'Intestines',
    isActive: false,
  },
];
