/** A saved address of a seeded customer, in Riyadh. */
export type SeedCustomerAddress = Readonly<{
  /** 1 to 30 characters. */
  label: string;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  street: string | null;
  building: string | null;
  /** Four uppercase letters then four digits, or null. */
  shortNationalAddress: string | null;
  driverInstructions: string | null;
  isDefault: boolean;
}>;
