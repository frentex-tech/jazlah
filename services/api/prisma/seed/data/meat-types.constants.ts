import type { SeedReferenceItem } from './seed-reference-item.type';

/** The seeded meat types: the breeds of the Saudi market; Najdi is inactive. */
export const SEED_MEAT_TYPES: readonly SeedReferenceItem[] = [
  { key: 'naimi', nameAr: 'نعيمي', nameEn: 'Naimi', isActive: true },
  { key: 'harri', nameAr: 'حري', nameEn: 'Harri', isActive: true },
  { key: 'sawakni', nameAr: 'سواكني', nameEn: 'Sawakni', isActive: true },
  {
    key: 'local-goat',
    nameAr: 'تيس بلدي',
    nameEn: 'Local goat',
    isActive: true,
  },
  { key: 'camel', nameAr: 'حاشي', nameEn: 'Camel (hashi)', isActive: true },
  { key: 'veal', nameAr: 'عجل', nameEn: 'Veal', isActive: true },
  { key: 'najdi', nameAr: 'نجدي', nameEn: 'Najdi', isActive: false },
];
