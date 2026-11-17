import type { SeedReferenceItem } from './seed-reference-item.type';

/** The seeded cutting styles; steak slices are inactive. */
export const SEED_CUTTING_STYLES: readonly SeedReferenceItem[] = [
  {
    key: 'fridge',
    nameAr: 'تقطيع ثلاجة',
    nameEn: 'Fridge cut',
    isActive: true,
  },
  { key: 'quarters', nameAr: 'أرباع', nameEn: 'Quarters', isActive: true },
  { key: 'halves', nameAr: 'أنصاص', nameEn: 'Halves', isActive: true },
  {
    key: 'mafatah',
    nameAr: 'مفطح',
    nameEn: 'Whole for serving (mafatah)',
    isActive: true,
  },
  { key: 'mandi', nameAr: 'تقطيع مندي', nameEn: 'Mandi cut', isActive: true },
  {
    key: 'kabsa',
    nameAr: 'تقطيع كبسة',
    nameEn: 'Kabsa cut',
    isActive: true,
  },
  {
    key: 'steak-slices',
    nameAr: 'شرائح ستيك',
    nameEn: 'Steak slices',
    isActive: false,
  },
];
