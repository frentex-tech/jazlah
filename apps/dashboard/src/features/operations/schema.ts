// The SCH-API-1 rules (openapi.json: end > start, leadDays 0–30, closed days not in the past), checked on the page, at our
// route and by the mock; error paths are the API's field paths, so client and API errors land on the same field.
// Relative imports with extensions: the unit test runs under plain node.
import { z } from 'zod';
import { halalasOf, sarInput } from '../../lib/money.ts';
import { SCOPES, type DayLimit, type OperationsPage, type OperationsSettings, type SetPause, type VendorDefault } from './types.ts';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
/** A real calendar date `YYYY-MM-DD` (no 2026-02-30). */
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const time = z.string().regex(TIME_RE);
const int = (min: number, max: number) => z.number().int().min(min).max(max);
const window = z.object({ start: time, end: time }).superRefine(({ start, end }, ctx) => {
  // `endBeforeStart` reaches the field as the constraint name (lib/route.ts invalidBody), as the API's own rule names.
  if (TIME_RE.test(start) && TIME_RE.test(end) && end <= start) ctx.addIssue({ code: 'custom', path: ['end'], message: 'endBeforeStart' });
});
/** A cutoff: null time means only the lead days count. */
const cutoff = z.object({ time: time.nullable(), leadDays: int(0, 30) });

export const ClosedDaySchema = z.object({
  date: z.string().refine(isDate, 'isDate'),
  scope: z.enum(SCOPES),
  reasonAr: z.string().trim().min(1).max(100),
  reasonEn: z.string().trim().min(1).max(100),
});
const message = z.string().trim().min(1).max(200);
/** The pause write: the messages are required when pausing, left out when resuming (the API ignores them). */
export const PausedSchema = z.union([
  z.object({ isPaused: z.literal(true), messageAr: message, messageEn: message }),
  z.object({ isPaused: z.literal(false) }).transform(() => ({ isPaused: false })),
]) satisfies z.ZodType<SetPause, unknown>;

/** What the page saves: everything but the pause, which only the pause flow changes (a stale tab must not resume). */
export const PageSchema = z.object({
  deliveryWindow: window,
  cutoffs: z.object({ readyMeat: cutoff, carcass: cutoff, cooked: cutoff, occasion: cutoff, adha: cutoff }),
  bookingHorizonDays: int(1, 60),
  closedDays: z.array(ClosedDaySchema).max(366),
  defaultCapacity: z.object({ ordersPerDay: int(1, 100000), carcassesPerDay: int(1, 100000) }),
  minOrderHalalas: int(0, 10_000_000),
  deliveryFeeHalalas: int(0, 1_000_000),
  cod: z.object({
    enabled: z.boolean(),
    maxOrderHalalas: int(1, 10_000_000).nullable(),
    allowedOrderTypes: z.array(z.enum(['ready_meat', 'carcass', 'cooked', 'occasion', 'adha', 'mixed'])),
    confirmation: z.enum(['auto', 'review']),
  }),
  complaintWindowHours: int(1, 720),
}) satisfies z.ZodType<OperationsPage, unknown>;

/** The page's PATCH body: only the keys sent change. The pause has its own route (PausedSchema). */
export const OperationsPatchSchema = PageSchema.partial();

export const VendorDefaultSchema = z.object({ ordersPerDay: int(1, 100000).nullable(), carcassesPerDay: int(1, 100000).nullable() }) satisfies z.ZodType<VendorDefault>;
export const DayLimitSchema = z.object({ ordersLimit: int(1, 100000).nullable(), carcassesLimit: int(1, 100000).nullable() }) satisfies z.ZodType<DayLimit>;

/** What the page edits: every typed number as text, amounts in SAR; same keys as the settings. */
export type Draft = Omit<OperationsPage, 'bookingHorizonDays' | 'defaultCapacity' | 'minOrderHalalas' | 'deliveryFeeHalalas' | 'cod' | 'complaintWindowHours' | 'cutoffs'> & {
  /** The edited cutoffs as typed (empty time: none); `adha` (Sprint 6) kept as received. */
  cutoffs: { [K in keyof OperationsPage['cutoffs']]: { time: string; leadDays: string } };
  bookingHorizonDays: string;
  defaultCapacity: { ordersPerDay: string; carcassesPerDay: string };
  minOrderHalalas: string;
  deliveryFeeHalalas: string;
  cod: Omit<OperationsPage['cod'], 'maxOrderHalalas'> & { maxOrderHalalas: string };
  complaintWindowHours: string;
};

/** Trimmed, Arabic-Indic digits in Latin («١٤:٠٠» → «14:00»). */
const latin = (s: string) => s.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
/** Typed whole number, or NaN (refused by the schema as not a number). Arabic digits accepted. */
export const intOf = (s: string) => {
  const v = latin(s);
  return /^\d{1,9}$/.test(v) ? Number(v) : NaN;
};
const money = (s: string) => halalasOf(s) ?? NaN;
const mapCutoffs = <T, U>(o: Record<keyof OperationsPage['cutoffs'], T>, f: (v: T) => U) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v as T)])) as Record<keyof OperationsPage['cutoffs'], U>;

export function toDraft({ paused: _paused, updatedAt: _updatedAt, ...s }: OperationsSettings): Draft {
  return {
    ...s,
    cutoffs: mapCutoffs(s.cutoffs, (c) => ({ time: c.time ?? '', leadDays: String(c.leadDays) })),
    bookingHorizonDays: String(s.bookingHorizonDays),
    defaultCapacity: { ordersPerDay: String(s.defaultCapacity.ordersPerDay), carcassesPerDay: String(s.defaultCapacity.carcassesPerDay) },
    minOrderHalalas: sarInput(s.minOrderHalalas),
    deliveryFeeHalalas: sarInput(s.deliveryFeeHalalas),
    cod: { ...s.cod, maxOrderHalalas: s.cod.maxOrderHalalas == null ? '' : sarInput(s.cod.maxOrderHalalas) },
    complaintWindowHours: String(s.complaintWindowHours),
  };
}

/** The page's draft as the PATCH body (see PageSchema). An empty cutoff time is null: no cutoff time. */
export function fromDraft(d: Draft): OperationsPage {
  return {
    ...d,
    cutoffs: mapCutoffs(d.cutoffs, (c) => ({ time: latin(c.time) || null, leadDays: intOf(c.leadDays) })),
    deliveryWindow: { start: latin(d.deliveryWindow.start), end: latin(d.deliveryWindow.end) },
    bookingHorizonDays: intOf(d.bookingHorizonDays),
    defaultCapacity: { ordersPerDay: intOf(d.defaultCapacity.ordersPerDay), carcassesPerDay: intOf(d.defaultCapacity.carcassesPerDay) },
    minOrderHalalas: money(d.minOrderHalalas),
    deliveryFeeHalalas: money(d.deliveryFeeHalalas),
    cod: { ...d.cod, maxOrderHalalas: d.cod.maxOrderHalalas.trim() === '' ? null : money(d.cod.maxOrderHalalas) },
    complaintWindowHours: intOf(d.complaintWindowHours),
  };
}

/** Field path → constraint name, as catalog/client.ts `fieldErrors` reads the API's VALIDATION_FAILED. */
export type FieldErrors = Record<string, string>;
export const zodErrors = (e: z.ZodError): FieldErrors =>
  Object.fromEntries(e.issues.map((i) => [i.path.join('.'), i.code === 'custom' ? i.message : i.code]).reverse());
/** The message key of a field error (messages `operations.errors.*`). */
export function errorKey(path: string, constraint: string): string {
  if (constraint === 'endBeforeStart' || constraint === 'notPast') return constraint;
  if (/(^|\.)(time|start|end)$/.test(path)) return 'time';
  if (path.startsWith('defaultCapacity.') || path.endsWith('Limit') || path.endsWith('PerDay')) return 'positive';
  if (path.endsWith('leadDays')) return 'leadDays';
  if (path.endsWith('Halalas')) return 'amount';
  if (path.startsWith('paused.')) return 'message';
  if (/^closedDays\.\d+\.reason/.test(path)) return 'reason';
  if (path.startsWith('closedDays')) return 'closedDay';
  return { bookingHorizonDays: 'horizon', complaintWindowHours: 'hours' }[path] ?? 'invalid';
}
