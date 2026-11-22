/** Switches one of a product's sizes on or off (out of stock). */
export type SizeAvailabilityChange = Readonly<{
  sizeId: string;
  isAvailable: boolean;
}>;
