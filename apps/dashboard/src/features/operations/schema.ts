// The SCH-API-1 rules (sprint-3.md: end > start, leadDays ≥ 0, closed days not in the past), checked on the page, at our
// route and by the mock; error paths are the API's field paths, so client and API errors land on the same field.
// Relative imports with extensions: the unit test runs under plain node.
import { z } from 'zod';
import { halalasOf, sarInput } from '../../lib/money.ts';
import { ORDER_TYPES, SCOPES, WEEKDAYS, type OperationsSettings, type VendorCapacity } from './types.ts';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
/** A real calendar date `YYYY-MM-DD` (no 2026-02-30). */
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const time = z.string().regex(TIME_RE);
const int = (min: number, max: number) => z.number().int().min(min).max(max);
const window = <T extends z.ZodRawShape>(shape: T, open: (v: z.infer<z.ZodObject<T>>) => boolean = () => true) =>
  z.object(shape).superRefine((v, ctx) => {
    const { start, end } = v as unknown as { start: string; end: string };
    // `endBeforeStart` reaches the field as the constraint name (lib/route.ts invalidBody), as the API's own rule names.
    if (open(v) && TIME_RE.test(start) && TIME_RE.test(end) && end <= start) ctx.addIssue({ code: 'custom', path: ['end'], message: 'endBeforeStart' });
  });

export const ClosedDaySchema = z.object({
  date: z.string().refine(isDate, 'isDate'),
  scope: z.enum(SCOPES),
  reasonAr: z.string().trim().min(1).max(100),
  reasonEn: z.string().trim().min(1).max(100),
});
export const PausedSchema = z.object({ isPaused: z.boolean(), messageAr: z.string().trim().min(1).max(200), messageEn: z.string().trim().min(1).max(200) });

export const OperationsSchema = z.object({
  deliveryWindow: window({ start: time, end: time }),
  cutoffs: z
    .object({
      ready_meat: z.object({ time, leadDays: int(0, 30) }),
      carcass: z.object({ time, leadDays: int(0, 30) }),
      cooked: z.object({ time, leadDays: int(0, 30) }),
      occasion: z.object({ time: time.optional(), leadDays: int(0, 30) }),
    })
    .loose(), // unknown cutoff keys (adha) pass through untouched
  bookingHorizonDays: int(1, 60),
  closedDays: z.array(ClosedDaySchema).max(366),
  capacity: z.object({ ordersPerDay: int(1, 100000), carcassesPerDay: int(1, 100000) }),
  minOrderHalalas: int(0, 10_000_000),
  deliveryFeeHalalas: int(0, 1_000_000),
  cod: z.object({
    enabled: z.boolean(),
    maxOrderHalalas: int(1, 10_000_000).nullable(),
    allowedOrderTypes: z.array(z.enum(ORDER_TYPES)),
    confirmation: z.enum(['auto', 'review']),
  }),
  paused: PausedSchema,
  complaintWindowHours: int(1, 720),
  workingHours: z.array(window({ day: z.enum(WEEKDAYS), open: z.boolean(), start: time, end: time }, (d) => d.open)).length(7).optional(),
}) satisfies z.ZodType<OperationsSettings>;

/** What the page saves: everything but `paused`, which only the pause flow changes (a stale tab must not resume). */
export const PageSchema = OperationsSchema.omit({ paused: true });

/** PUT body: only the keys sent change (the header switch sends `paused` alone). */
export const OperationsPatchSchema = OperationsSchema.partial();

export const VendorDefaultSchema = z.object({ ordersPerDay: int(1, 100000).nullable(), carcassesPerDay: int(1, 100000).nullable() }) satisfies z.ZodType<Omit<VendorCapacity, 'days'>>;
export const DayLimitSchema = z.object({ ordersLimit: int(1, 100000).nullable(), carcassesLimit: int(1, 100000).nullable() });

/** What the page edits: every typed number as text, amounts in SAR; same keys as the settings. */
export type Draft = Omit<OperationsSettings, 'paused' | 'bookingHorizonDays' | 'capacity' | 'minOrderHalalas' | 'deliveryFeeHalalas' | 'cod' | 'complaintWindowHours' | 'cutoffs'> & {
  /** The known order types as typed; other keys kept as received. */
  cutoffs: { [K in (typeof ORDER_TYPES)[number]]: { time: string; leadDays: string } } & Record<string, unknown>;
  bookingHorizonDays: string;
  capacity: { ordersPerDay: string; carcassesPerDay: string };
  minOrderHalalas: string;
  deliveryFeeHalalas: string;
  cod: Omit<OperationsSettings['cod'], 'maxOrderHalalas'> & { maxOrderHalalas: string };
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
/** Only the known order types are mapped; any other cutoff key (adha) is carried as received. */
const mapCutoffs = <T, U>(o: Record<string, unknown>, f: (v: T) => U) => ({ ...o, ...Object.fromEntries(ORDER_TYPES.map((k) => [k, f(o[k] as T)])) });

export function toDraft({ paused: _paused, ...s }: OperationsSettings): Draft {
  return {
    ...s,
    cutoffs: mapCutoffs(s.cutoffs, (c: { time?: string; leadDays: number }) => ({ time: c.time ?? '', leadDays: String(c.leadDays) })) as Draft['cutoffs'],
    bookingHorizonDays: String(s.bookingHorizonDays),
    capacity: { ordersPerDay: String(s.capacity.ordersPerDay), carcassesPerDay: String(s.capacity.carcassesPerDay) },
    minOrderHalalas: sarInput(s.minOrderHalalas),
    deliveryFeeHalalas: sarInput(s.deliveryFeeHalalas),
    cod: { ...s.cod, maxOrderHalalas: s.cod.maxOrderHalalas == null ? '' : sarInput(s.cod.maxOrderHalalas) },
    complaintWindowHours: String(s.complaintWindowHours),
  };
}

/** The page's draft as settings, without `paused` (see PageSchema). An empty occasion time is left out (optional). */
export function fromDraft(d: Draft): Omit<OperationsSettings, 'paused'> {
  return {
    ...d,
    cutoffs: mapCutoffs(d.cutoffs, (c: { time: string; leadDays: string }) => {
      const t = latin(c.time);
      return { ...(t !== '' || c !== d.cutoffs.occasion ? { time: t } : {}), leadDays: intOf(c.leadDays) };
    }) as OperationsSettings['cutoffs'],
    deliveryWindow: { start: latin(d.deliveryWindow.start), end: latin(d.deliveryWindow.end) },
    bookingHorizonDays: intOf(d.bookingHorizonDays),
    capacity: { ordersPerDay: intOf(d.capacity.ordersPerDay), carcassesPerDay: intOf(d.capacity.carcassesPerDay) },
    minOrderHalalas: money(d.minOrderHalalas),
    deliveryFeeHalalas: money(d.deliveryFeeHalalas),
    cod: { ...d.cod, maxOrderHalalas: d.cod.maxOrderHalalas.trim() === '' ? null : money(d.cod.maxOrderHalalas) },
    workingHours: d.workingHours?.map((h) => ({ ...h, start: latin(h.start), end: latin(h.end) })),
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
  if (path.startsWith('capacity.') || path.endsWith('Limit') || path.endsWith('PerDay')) return 'positive';
  if (path.endsWith('leadDays')) return 'leadDays';
  if (path.endsWith('Halalas')) return 'amount';
  if (path.startsWith('paused.')) return 'message';
  if (/^closedDays\.\d+\.reason/.test(path)) return 'reason';
  if (path.startsWith('closedDays')) return 'closedDay';
  return { bookingHorizonDays: 'horizon', complaintWindowHours: 'hours' }[path] ?? 'invalid';
}
