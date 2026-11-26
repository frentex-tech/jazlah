import type { TimeWindow } from '@modules/settings';
import type { VendorStore } from '@modules/vendors';
import type { PickupTerms } from './pickup-terms.type';

/**
 * How a store offers pickup, from what vendors hold today.
 *
 * ASSUMPTION (2026-11-26, backend owner, DECISIONS.md "Sprint 3 order"): vendors have no
 * working hours and no pickup switch yet, so until they do:
 * - every store offers pickup;
 * - a pickup day is open or closed exactly as a delivery day (closed days with scope
 *   `pickup` or `both` close it), with the operations delivery window, so the days
 *   never answer VENDOR_CLOSED;
 * - the pickup point is the store's name and map point, its contact phone (#244), its
 *   city as the address text (the same in both languages), and no hours.
 * Vendor hours and a per-store pickup switch come after November 30: they change only
 * this function.
 */
export function pickupTermsOf(
  store: VendorStore,
  deliveryWindow: TimeWindow,
): PickupTerms {
  return {
    isOffered: true,
    window: deliveryWindow,
    point: {
      name: store.name,
      address: store.city === null ? null : { ar: store.city, en: store.city },
      location: store.location,
      phone: store.contactPhone,
      hours: null,
    },
  };
}
