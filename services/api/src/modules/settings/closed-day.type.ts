import type { CalendarDate } from '@common/time/calendar-date.type';
import type { CLOSED_DAY_SCOPES } from './closed-day-scopes.constants';

/** A day nothing (or only one fulfilment method) is offered, with the reason customers see. */
export type ClosedDay = Readonly<{
  date: CalendarDate;
  scope: (typeof CLOSED_DAY_SCOPES)[number];
  reasonAr: string;
  reasonEn: string;
}>;
