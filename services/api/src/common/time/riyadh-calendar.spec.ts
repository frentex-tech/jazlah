import { RiyadhCalendar } from './riyadh-calendar';

describe('RiyadhCalendar', () => {
  describe('dateOf', () => {
    it('is still the previous Riyadh day one millisecond before Riyadh midnight', () => {
      expect(RiyadhCalendar.dateOf(new Date('2026-11-29T20:59:59.999Z'))).toBe(
        '2026-11-29',
      );
    });

    it('turns to the next Riyadh day at Riyadh midnight (21:00 UTC)', () => {
      expect(RiyadhCalendar.dateOf(new Date('2026-11-29T21:00:00.000Z'))).toBe(
        '2026-11-30',
      );
    });

    it('answers the Riyadh day at 01:30 Riyadh, while UTC is still the day before', () => {
      expect(RiyadhCalendar.dateOf(new Date('2026-11-29T22:30:00.000Z'))).toBe(
        '2026-11-30',
      );
    });

    it('crosses a year at Riyadh midnight', () => {
      expect(RiyadhCalendar.dateOf(new Date('2026-12-31T21:00:00.000Z'))).toBe(
        '2027-01-01',
      );
    });
  });

  describe('minuteOfDay', () => {
    it('is 0 at Riyadh midnight and 1439 one minute before', () => {
      expect(RiyadhCalendar.minuteOfDay(new Date('2026-11-29T21:00:00Z'))).toBe(
        0,
      );
      expect(RiyadhCalendar.minuteOfDay(new Date('2026-11-29T20:59:00Z'))).toBe(
        1439,
      );
    });

    it('is 20:00 Riyadh at 17:00 UTC', () => {
      expect(RiyadhCalendar.minuteOfDay(new Date('2026-11-29T17:00:00Z'))).toBe(
        1200,
      );
    });
  });

  describe('day arithmetic', () => {
    it('adds days across a month, a leap day and a year', () => {
      expect(RiyadhCalendar.addDays('2026-11-30', 1)).toBe('2026-12-01');
      expect(RiyadhCalendar.addDays('2028-02-28', 1)).toBe('2028-02-29');
      expect(RiyadhCalendar.addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(RiyadhCalendar.addDays('2026-12-01', -1)).toBe('2026-11-30');
      expect(RiyadhCalendar.addDays('2026-12-01', 0)).toBe('2026-12-01');
    });

    it('counts the days between two dates', () => {
      expect(RiyadhCalendar.daysBetween('2026-11-30', '2026-12-13')).toBe(13);
      expect(RiyadhCalendar.daysBetween('2026-12-13', '2026-11-30')).toBe(-13);
    });

    it('names the weekday', () => {
      // 2026-11-29 is a Sunday.
      expect(RiyadhCalendar.dayOfWeek('2026-11-29')).toBe(0);
      expect(RiyadhCalendar.dayOfWeek('2026-12-05')).toBe(6);
    });

    it('starts a Riyadh day at 21:00 UTC the day before', () => {
      expect(RiyadhCalendar.startOf('2026-11-30').toISOString()).toBe(
        '2026-11-29T21:00:00.000Z',
      );
    });
  });

  describe('parsing', () => {
    it('reads a time of day as minutes', () => {
      expect(RiyadhCalendar.minutesOf('00:00')).toBe(0);
      expect(RiyadhCalendar.minutesOf('23:59')).toBe(1439);
      expect(() => RiyadhCalendar.minutesOf('24:00')).toThrow(RangeError);
    });

    it('accepts real calendar dates only', () => {
      expect(RiyadhCalendar.isCalendarDate('2028-02-29')).toBe(true);
      expect(RiyadhCalendar.isCalendarDate('2026-02-29')).toBe(false);
      expect(RiyadhCalendar.isCalendarDate('2026-11-3')).toBe(false);
      expect(() => RiyadhCalendar.addDays('2026-02-30', 1)).toThrow(RangeError);
    });
  });
});
