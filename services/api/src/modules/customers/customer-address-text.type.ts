/**
 * The readable parts of an address, filled by the app from the map and editable by the
 * customer; each null when not given. Delivery companies and vendors read them.
 */
export type CustomerAddressText = Readonly<{
  city: string | null;
  district: string | null;
  street: string | null;
  /** Building number, floor, apartment. */
  building: string | null;
  /** The Saudi short national address, `ABCD1234` (SHORT_NATIONAL_ADDRESS). */
  shortNationalAddress: string | null;
  driverInstructions: string | null;
}>;
