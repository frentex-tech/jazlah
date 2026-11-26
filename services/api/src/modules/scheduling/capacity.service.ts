import { Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CalendarDate } from '@common/time/calendar-date.type';
import { DbContext } from '@infra/database/db-context';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { OperationsSettingsService } from '@modules/settings';
import type { CapacityRequest } from './capacity-request.type';
import type { DayBooking } from './day-booking.type';

/**
 * Each vendor's bookings per Riyadh day (table `day_capacities`, SCH-API-2, FR-SCH-04).
 *
 * `reserve` takes one order (and its whole carcasses) on a day, atomically: the day's
 * row is made if missing (`INSERT … ON CONFLICT DO NOTHING`), then one conditional
 * `UPDATE … WHERE booked + n <= limit`; no row changed means the day is full
 * (DAY_FULL). No read-then-write and no lock on a row that may not exist, so two
 * reservations for the last place cannot both succeed. A limit is the day's own, else
 * the operations settings' default. Call `reserve` and `release` inside the
 * transaction that places or cancels the order (`TransactionRunner.run`).
 */
@Injectable()
export class CapacityService {
  constructor(
    private readonly db: DbContext,
    private readonly settings: OperationsSettingsService,
  ) {}

  /** The vendor's bookings from `from` to `to` (both included), by day; days without a row are left out. */
  async bookingsOf(
    vendorId: string,
    from: CalendarDate,
    to: CalendarDate,
  ): Promise<Map<CalendarDate, DayBooking>> {
    const rows = await this.query(
      () => this.db.client.$queryRaw<
        { date: string; ordersBooked: number; ordersLimit: number | null }[]
      >`
        SELECT to_char("date", 'YYYY-MM-DD') AS "date",
               "orders_booked" AS "ordersBooked", "orders_limit" AS "ordersLimit"
        FROM "day_capacities"
        WHERE "vendor_id" = ${vendorId}::uuid
          AND "date" BETWEEN ${from}::date AND ${to}::date`,
    );
    return new Map(
      rows.map((row) => [
        row.date,
        { ordersBooked: row.ordersBooked, ordersLimit: row.ordersLimit },
      ]),
    );
  }

  /** Takes one order and `carcasses` whole carcasses on the day; DAY_FULL when either would pass its limit. */
  async reserve(request: CapacityRequest): Promise<void> {
    const { defaultCapacity } = await this.settings.current();
    const { vendorId, date, carcasses } = request;
    await this.query(
      () => this.db.client.$executeRaw`
        INSERT INTO "day_capacities" ("vendor_id", "date", "updated_at")
        VALUES (${vendorId}::uuid, ${date}::date, now())
        ON CONFLICT ("vendor_id", "date") DO NOTHING`,
    );
    const changed = await this.query(
      () => this.db.client.$executeRaw`
        UPDATE "day_capacities"
        SET "orders_booked" = "orders_booked" + 1,
            "carcasses_booked" = "carcasses_booked" + ${carcasses},
            "updated_at" = now()
        WHERE "vendor_id" = ${vendorId}::uuid AND "date" = ${date}::date
          AND "orders_booked" + 1 <= COALESCE("orders_limit", ${defaultCapacity.ordersPerDay})
          AND "carcasses_booked" + ${carcasses} <= COALESCE("carcasses_limit", ${defaultCapacity.carcassesPerDay})`,
    );
    if (changed === 0) {
      throw new AppError(ErrorCode.DAY_FULL);
    }
  }

  /** Gives back what `reserve` took (an order cancelled); never below zero. */
  async release(request: CapacityRequest): Promise<void> {
    const { vendorId, date, carcasses } = request;
    await this.query(
      () => this.db.client.$executeRaw`
        UPDATE "day_capacities"
        SET "orders_booked" = GREATEST("orders_booked" - 1, 0),
            "carcasses_booked" = GREATEST("carcasses_booked" - ${carcasses}, 0),
            "updated_at" = now()
        WHERE "vendor_id" = ${vendorId}::uuid AND "date" = ${date}::date`,
    );
  }

  private async query<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
