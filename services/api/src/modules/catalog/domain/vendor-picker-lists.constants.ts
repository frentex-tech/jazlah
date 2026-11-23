/**
 * The admin lists a vendor reads, active entries only, to fill a product form. Categories
 * are not among them: vendors read the public categories, which are already active only.
 */
export const VENDOR_PICKER_LISTS = [
  'meat_types',
  'cutting_styles',
  'exclusion_items',
] as const;
