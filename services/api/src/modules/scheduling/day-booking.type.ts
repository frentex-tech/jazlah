/** What a vendor has booked on one day, and the day's own limit (null: the default). */
export type DayBooking = Readonly<{
  ordersBooked: number;
  ordersLimit: number | null;
}>;
