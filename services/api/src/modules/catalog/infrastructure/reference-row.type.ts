/** A row of any admin list table (categories, meat_types, cutting_styles, exclusion_items). */
export type ReferenceRow = Readonly<{
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  createdAt: Date;
}>;
