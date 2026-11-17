import type { VendorPickerList } from '../domain/vendor-picker-list.type';

/** The lists a vendor reads as they appear in paths (`vendor/lists/:list`), and the list of each. */
export const VENDOR_PICKER_LIST_PATHS = {
  'meat-types': 'meat_types',
  'cutting-styles': 'cutting_styles',
  'exclusion-items': 'exclusion_items',
} as const satisfies Readonly<Record<string, VendorPickerList>>;
