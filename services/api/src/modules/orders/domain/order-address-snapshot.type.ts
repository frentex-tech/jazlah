import type { OrderGeoPoint } from './order-geo-point.type';

/** The delivery address as it was when the order was placed. */
export type OrderAddressSnapshot = Readonly<{
  label: string;
  location: OrderGeoPoint;
  city: string | null;
  district: string | null;
  street: string | null;
  building: string | null;
  shortNationalAddress: string | null;
  driverInstructions: string | null;
}>;
