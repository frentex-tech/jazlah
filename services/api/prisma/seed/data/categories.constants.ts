import type { SeedCategory } from './seed-category.type';

/** The seeded categories, in their admin display order; the last is inactive (hidden publicly). */
export const SEED_CATEGORIES: readonly SeedCategory[] = [
  {
    key: 'whole-carcasses',
    nameAr: 'ذبائح كاملة',
    nameEn: 'Whole carcasses',
    isActive: true,
    sortOrder: 0,
  },
  {
    key: 'half-carcasses',
    nameAr: 'نصف ذبيحة',
    nameEn: 'Half carcasses',
    isActive: true,
    sortOrder: 1,
  },
  {
    key: 'quarter-carcasses',
    nameAr: 'ربع ذبيحة',
    nameEn: 'Quarter carcasses',
    isActive: true,
    sortOrder: 2,
  },
  {
    key: 'cut-meat',
    nameAr: 'لحوم مقطعة',
    nameEn: 'Cut meat',
    isActive: true,
    sortOrder: 3,
  },
  {
    key: 'minced',
    nameAr: 'مفروم',
    nameEn: 'Minced meat',
    isActive: true,
    sortOrder: 4,
  },
  {
    key: 'eid-offers',
    nameAr: 'عروض العيد',
    nameEn: 'Eid offers',
    isActive: false,
    sortOrder: 5,
  },
];
