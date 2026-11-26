import { RiyadhCalendar } from '@common/time/riyadh-calendar';
import type { ClosedDay, Cutoffs } from '@modules/settings';
import { checkoutDayOf } from './checkout-day-of';
import { computeCheckoutDays } from './compute-checkout-days';
import type { DayBooking } from './day-booking.type';
import type { DayRules } from './day-rules.type';

const TODAY = '2026-11-26';
const WINDOW = { start: '16:00', end: '22:00' };
const CUTOFFS: Cutoffs = {
  readyMeat: { time: '12:00', leadDays: 0 },
  carcass: { time: '12:00', leadDays: 1 },
  cooked: { time: '10:00', leadDays: 1 },
  occasion: { time: null, leadDays: 3 },
  adha: { time: null, leadDays: 3 },
};
const at = (hhmm: string) => RiyadhCalendar.minutesOf(hhmm);
const day = (offset: number) => RiyadhCalendar.addDays(TODAY, offset);
const closed = (date: string, scope: ClosedDay['scope']): ClosedDay => ({
  date,
  scope,
  reasonAr: 'إجازة',
  reasonEn: 'Holiday',
});

function rules(over: Partial<DayRules> = {}): DayRules {
  return {
    today: TODAY,
    minuteOfDay: at('09:00'),
    method: 'delivery',
    orderTypes: ['ready_meat'],
    cutoffs: CUTOFFS,
    bookingHorizonDays: 14,
    closedDays: [],
    window: WINDOW,
    bookings: new Map<string, DayBooking>(),
    defaultOrdersLimit: 40,
    ...over,
  };
}

const reasons = (r: DayRules) => computeCheckoutDays(r).map((d) => d.reason);

describe('computeCheckoutDays', () => {
  describe('the horizon', () => {
    it('lists the horizon days from today, today included', () => {
      const days = computeCheckoutDays(rules());

      expect(days).toHaveLength(14);
      expect(days[0]?.date).toBe(TODAY);
      expect(days[13]?.date).toBe(day(13));
    });

    it('lists a horizon of one day: today only', () => {
      expect(
        computeCheckoutDays(rules({ bookingHorizonDays: 1 })).map(
          (d) => d.date,
        ),
      ).toEqual([TODAY]);
    });

    it('crosses a month and a year end', () => {
      const days = computeCheckoutDays(
        rules({ today: '2026-12-30', bookingHorizonDays: 4 }),
      );

      expect(days.map((d) => d.date)).toEqual([
        '2026-12-30',
        '2026-12-31',
        '2027-01-01',
        '2027-01-02',
      ]);
    });

    it('gives an available day the window and no reason', () => {
      expect(computeCheckoutDays(rules())[0]).toEqual({
        date: TODAY,
        isAvailable: true,
        reason: null,
        window: WINDOW,
      });
    });
  });

  describe('the cut-off', () => {
    it.each([
      ['11:59', null],
      ['12:00', null],
      ['12:01', 'PAST_CUTOFF'],
      ['23:59', 'PAST_CUTOFF'],
      ['00:00', null],
    ])(
      'at %s Riyadh today is %p for ready meat (cut-off 12:00)',
      (time, reason) => {
        expect(reasons(rules({ minuteOfDay: at(time) }))[0]).toBe(reason);
      },
    );

    it('after the cut-off, tomorrow is the first day', () => {
      const days = computeCheckoutDays(rules({ minuteOfDay: at('12:01') }));

      expect(days[1]).toMatchObject({ date: day(1), isAvailable: true });
    });

    it('counts the lead days: carcass before its cut-off starts tomorrow', () => {
      expect(reasons(rules({ orderTypes: ['carcass'] })).slice(0, 2)).toEqual([
        'PAST_CUTOFF',
        null,
      ]);
    });

    it('counts the lead days and the cut-off together: carcass after 12:00 starts in two days', () => {
      expect(
        reasons(
          rules({ orderTypes: ['carcass'], minuteOfDay: at('12:01') }),
        ).slice(0, 3),
      ).toEqual(['PAST_CUTOFF', 'PAST_CUTOFF', null]);
    });

    it('ignores the time of a rule without a cut-off time', () => {
      const late = reasons(
        rules({ orderTypes: ['occasion'], minuteOfDay: at('23:59') }),
      );

      expect(late.slice(0, 4)).toEqual([
        'PAST_CUTOFF',
        'PAST_CUTOFF',
        'PAST_CUTOFF',
        null,
      ]);
    });

    it('takes the strictest kind of a mixed cart', () => {
      const mixed = reasons(
        rules({
          orderTypes: ['ready_meat', 'cooked'],
          minuteOfDay: at('11:00'),
        }),
      );

      // cooked: lead 1, cut-off 10:00 passed → the day after tomorrow.
      expect(mixed.slice(0, 3)).toEqual(['PAST_CUTOFF', 'PAST_CUTOFF', null]);
    });

    it('makes today the first day for a cart with no kinds', () => {
      expect(
        reasons(rules({ orderTypes: [], minuteOfDay: at('23:00') }))[0],
      ).toBe(null);
    });

    it('closes the whole horizon when the lead days pass it', () => {
      const days = reasons(
        rules({ orderTypes: ['occasion'], bookingHorizonDays: 3 }),
      );

      expect(days).toEqual(['PAST_CUTOFF', 'PAST_CUTOFF', 'PAST_CUTOFF']);
    });
  });

  describe('closed days', () => {
    it('closes a day closed for both methods', () => {
      expect(reasons(rules({ closedDays: [closed(day(2), 'both')] }))[2]).toBe(
        'CLOSED',
      );
    });

    it('closes a delivery-only closed day for delivery, leaving pickup open', () => {
      const closedDays = [closed(day(2), 'delivery')];

      expect(reasons(rules({ closedDays }))[2]).toBe('CLOSED');
      expect(reasons(rules({ closedDays, method: 'pickup' }))[2]).toBeNull();
    });

    it('closes a pickup-only closed day for pickup, leaving delivery open', () => {
      const closedDays = [closed(day(3), 'pickup')];

      expect(reasons(rules({ closedDays, method: 'pickup' }))[3]).toBe(
        'CLOSED',
      );
      expect(reasons(rules({ closedDays }))[3]).toBeNull();
    });

    it('closes the last horizon day', () => {
      expect(
        reasons(rules({ closedDays: [closed(day(13), 'both')] }))[13],
      ).toBe('CLOSED');
    });

    it('ignores a closed day outside the horizon', () => {
      expect(
        reasons(rules({ closedDays: [closed(day(20), 'both')] })),
      ).not.toContain('CLOSED');
    });

    it('reports a day both past the cut-off and closed as PAST_CUTOFF', () => {
      expect(
        reasons(
          rules({
            minuteOfDay: at('13:00'),
            closedDays: [closed(TODAY, 'both')],
          }),
        )[0],
      ).toBe('PAST_CUTOFF');
    });
  });

  describe('capacity', () => {
    const booked = (ordersBooked: number, ordersLimit: number | null = null) =>
      new Map([[day(1), { ordersBooked, ordersLimit }]]);

    it('keeps a day open one order below the limit', () => {
      expect(reasons(rules({ bookings: booked(39) }))[1]).toBeNull();
    });

    it('fills a day exactly at the limit', () => {
      expect(reasons(rules({ bookings: booked(40) }))[1]).toBe('FULL');
    });

    it('uses the day’s own limit over the default', () => {
      expect(reasons(rules({ bookings: booked(5, 5) }))[1]).toBe('FULL');
      expect(reasons(rules({ bookings: booked(39, 60) }))[1]).toBeNull();
    });

    it('closes every day when the default limit is zero', () => {
      expect(new Set(reasons(rules({ defaultOrdersLimit: 0 })))).toEqual(
        new Set(['FULL']),
      );
    });

    it('reports a closed and full day as CLOSED', () => {
      expect(
        reasons(
          rules({ bookings: booked(40), closedDays: [closed(day(1), 'both')] }),
        )[1],
      ).toBe('CLOSED');
    });
  });
});

describe('checkoutDayOf', () => {
  it('answers a day of the horizon as computed', () => {
    expect(checkoutDayOf(rules(), day(3))).toEqual({
      date: day(3),
      isAvailable: true,
      reason: null,
      window: WINDOW,
    });
  });

  it('is PAST_CUTOFF before today and OUTSIDE_HORIZON after the last day', () => {
    expect(checkoutDayOf(rules(), day(-1)).reason).toBe('PAST_CUTOFF');
    expect(checkoutDayOf(rules(), day(14)).reason).toBe('OUTSIDE_HORIZON');
    expect(checkoutDayOf(rules(), day(13)).reason).toBeNull();
  });
});
