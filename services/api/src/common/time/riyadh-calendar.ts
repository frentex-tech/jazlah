import type { CalendarDate } from './calendar-date.type';
import { RIYADH_UTC_OFFSET_MS } from './riyadh-utc-offset.constants';

const DAY_MS = 24 * 60 * 60 * 1000;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_OF_DAY = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * The Riyadh business calendar (the reserved "time helper", invariants.md, Time): which
 * day an instant falls on in Riyadh, the minute of that day, day arithmetic and the
 * instant a Riyadh day starts. Every business rule about "today", cut-offs, the booking
 * horizon or an order number's day goes through it, never through `Date#getHours`,
 * `getDate` or the server's time zone. Riyadh is UTC+3 all year (`RIYADH_UTC_OFFSET_MS`,
 * its ASSUMPTION). Dates are `CalendarDate` strings; instants are `Date` in UTC.
 */
export class RiyadhCalendar {
  /** The Riyadh day `instant` falls on: 2026-11-29T21:00:00Z is `'2026-11-30'`. */
  static dateOf(instant: Date): CalendarDate {
    return new Date(instant.getTime() + RIYADH_UTC_OFFSET_MS)
      .toISOString()
      .slice(0, 10);
  }

  /** Minutes since Riyadh midnight at `instant`, 0 to 1439. */
  static minuteOfDay(instant: Date): number {
    const shifted = instant.getTime() + RIYADH_UTC_OFFSET_MS;
    const intoDay = ((shifted % DAY_MS) + DAY_MS) % DAY_MS;
    return Math.floor(intoDay / 60_000);
  }

  /** `date` plus `days` (negative to go back): `addDays('2026-12-31', 1)` is `'2027-01-01'`. */
  static addDays(date: CalendarDate, days: number): CalendarDate {
    return new Date(RiyadhCalendar.utcMidnightOf(date) + days * DAY_MS)
      .toISOString()
      .slice(0, 10);
  }

  /** Whole days from `from` to `to` (negative when `to` is earlier). */
  static daysBetween(from: CalendarDate, to: CalendarDate): number {
    return Math.round(
      (RiyadhCalendar.utcMidnightOf(to) - RiyadhCalendar.utcMidnightOf(from)) /
        DAY_MS,
    );
  }

  /** The weekday of `date`: 0 Sunday to 6 Saturday. */
  static dayOfWeek(date: CalendarDate): number {
    return new Date(RiyadhCalendar.utcMidnightOf(date)).getUTCDay();
  }

  /** The instant `date` starts in Riyadh (00:00 Riyadh, 21:00 UTC the day before). */
  static startOf(date: CalendarDate): Date {
    return new Date(RiyadhCalendar.utcMidnightOf(date) - RIYADH_UTC_OFFSET_MS);
  }

  /** `'HH:mm'` as minutes since midnight: `'20:00'` is 1200. Throws on another shape. */
  static minutesOf(timeOfDay: string): number {
    const match = TIME_OF_DAY.exec(timeOfDay);
    if (match === null) {
      throw new RangeError(`Not a time of day: ${timeOfDay}`);
    }
    return Number(match[1]) * 60 + Number(match[2]);
  }

  /** Whether `value` is a real `yyyy-MM-dd` day (not `2026-02-30`). */
  static isCalendarDate(value: string): boolean {
    const match = CALENDAR_DATE.exec(value);
    if (match === null) {
      return false;
    }
    const utc = Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    );
    return new Date(utc).toISOString().slice(0, 10) === value;
  }

  private static utcMidnightOf(date: CalendarDate): number {
    if (!RiyadhCalendar.isCalendarDate(date)) {
      throw new RangeError(`Not a calendar date: ${date}`);
    }
    return Date.parse(`${date}T00:00:00.000Z`);
  }
}
