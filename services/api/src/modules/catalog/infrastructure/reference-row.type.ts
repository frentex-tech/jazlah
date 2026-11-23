/**
 * A row of any admin list table (categories, meat_types, cutting_styles,
 * exclusion_items); `sortOrder` and `imageMediaId` only in a category's.
 */
export type ReferenceRow = Readonly<{
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  sortOrder?: number;
  imageMediaId?: string | null;
  createdAt: Date;
}>;
