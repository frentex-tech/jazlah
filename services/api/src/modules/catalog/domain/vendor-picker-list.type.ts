import type { VENDOR_PICKER_LISTS } from './vendor-picker-lists.constants';

/** An admin list a vendor reads to fill a product form: meat types, cutting styles, "without" items. */
export type VendorPickerList = (typeof VENDOR_PICKER_LISTS)[number];
