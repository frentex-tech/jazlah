import type { VENDOR_PICKER_LIST_PATHS } from './vendor-picker-list-paths.constants';

/** A list a vendor reads, in a path: `meat-types`, `cutting-styles`, `exclusion-items`. */
export type VendorPickerListPath = keyof typeof VENDOR_PICKER_LIST_PATHS;
