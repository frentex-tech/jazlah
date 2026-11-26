/** How many orders and whole carcasses a vendor takes on one day. */
export type DailyCapacity = Readonly<{
  ordersPerDay: number;
  carcassesPerDay: number;
}>;
