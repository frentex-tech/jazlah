// The CRT-API-3 coupon rules (sprint-3.md), checked on the page, at our route and by the mock; error paths are the
// API's field names, so client and API errors land on the same field. Relative imports with extensions: the unit test
// runs under plain node.
import { z } from 'zod';
import { halalasOf, sarInput } from '../../lib/money.ts';
import { COUPON_STATUSES, COUPON_TYPES, type CouponInput } from './types.ts';

const MAX_HALALAS = 10_000_000;
const int = (min: number, max: number) => z.number().int().min(min).max(max);
const instant = z.iso.datetime({ offset: true });

const Fields = z.object({
  // Letters, digits, - and _; unique without regard to case (the API's rule), sent upper-case.
  code: z.string().trim().regex(/^[A-Za-z0-9_-]{3,32}$/).transform((s) => s.toUpperCase()),
  type: z.enum(COUPON_TYPES),
  value: int(1, MAX_HALALAS),
  maxDiscountHalalas: int(1, MAX_HALALAS).nullable(),
  minOrderHalalas: int(0, MAX_HALALAS).nullable(),
  vendorIds: z.array(z.uuid()).max(200),
  categoryIds: z.array(z.uuid()).max(200),
  startsAt: instant,
  endsAt: instant,
  usageLimit: int(1, 10_000_000).nullable(),
  perUserLimit: int(1, 1000).nullable(),
  isActive: z.boolean(),
  firstOrderOnly: z.boolean(),
});

/** Rules across fields; on a partial body only those whose fields are all sent. Custom names reach the field as its constraint. */
function crossRules(v: Partial<z.infer<typeof Fields>>, ctx: z.RefinementCtx) {
  if (v.type === 'percent' && v.value !== undefined && v.value > 100) ctx.addIssue({ code: 'custom', path: ['value'], message: 'percent' });
  if (v.startsAt && v.endsAt && Date.parse(v.endsAt) <= Date.parse(v.startsAt)) ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'endBeforeStart' });
}

export const CouponSchema = Fields.superRefine(crossRules) satisfies z.ZodType<CouponInput, unknown>;
/** PATCH body: only the keys sent change (deactivate sends `isActive` alone). */
export const CouponPatchSchema = Fields.partial().superRefine(crossRules);
export const CouponQuerySchema = z.object({ status: z.enum(COUPON_STATUSES).optional(), q: z.string().trim().min(1).max(32).optional(), cursor: z.string().min(1).optional() });

// Riyadh is UTC+3 all year (no daylight saving), so a fixed offset is exact.
const RIYADH_MS = 3 * 3_600_000;
/** `datetime-local` text read as Riyadh time («2026-12-01T00:00») → ISO instant; '' when not a time. */
export function instantOf(local: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return '';
  const ms = Date.parse(`${local}:00+03:00`);
  return Number.isNaN(ms) ? '' : new Date(ms).toISOString();
}
/** ISO instant → the `datetime-local` text in Riyadh time. */
export const localOf = (iso: string) => new Date(Date.parse(iso) + RIYADH_MS).toISOString().slice(0, 16);

/** What the form edits: numbers as typed (amounts in SAR), dates as Riyadh `datetime-local` text. */
export type Draft = Omit<CouponInput, 'value' | 'maxDiscountHalalas' | 'minOrderHalalas' | 'usageLimit' | 'perUserLimit'> & {
  value: string;
  maxDiscountHalalas: string;
  minOrderHalalas: string;
  usageLimit: string;
  perUserLimit: string;
};

const latin = (s: string) => s.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
/** Typed whole number, or NaN (refused by the schema). Arabic digits accepted. */
const intOf = (s: string) => (/^\d{1,9}$/.test(latin(s)) ? Number(latin(s)) : NaN);
const money = (s: string) => halalasOf(s) ?? NaN;
const optional = <T>(s: string, f: (s: string) => T) => (s.trim() === '' ? null : f(s));

export function emptyDraft(now = Date.now()): Draft {
  const start = localOf(new Date(now).toISOString()).slice(0, 10);
  return {
    code: '', type: 'percent', value: '', maxDiscountHalalas: '', minOrderHalalas: '', vendorIds: [], categoryIds: [],
    startsAt: `${start}T00:00`, endsAt: '', usageLimit: '', perUserLimit: '1', isActive: true, firstOrderOnly: false,
  };
}

export function toDraft(c: CouponInput): Draft {
  return {
    ...c,
    value: c.type === 'percent' ? String(c.value) : sarInput(c.value),
    maxDiscountHalalas: c.maxDiscountHalalas === null ? '' : sarInput(c.maxDiscountHalalas),
    minOrderHalalas: c.minOrderHalalas === null ? '' : sarInput(c.minOrderHalalas),
    startsAt: localOf(c.startsAt),
    endsAt: localOf(c.endsAt),
    usageLimit: c.usageLimit === null ? '' : String(c.usageLimit),
    perUserLimit: c.perUserLimit === null ? '' : String(c.perUserLimit),
  };
}

export function fromDraft(d: Draft): CouponInput {
  return {
    ...d,
    code: d.code.trim(),
    value: d.type === 'percent' ? intOf(d.value) : money(d.value),
    // A cap only limits a percent coupon: a fixed one sends none.
    maxDiscountHalalas: d.type === 'percent' ? optional(d.maxDiscountHalalas, money) : null,
    minOrderHalalas: optional(d.minOrderHalalas, money),
    startsAt: instantOf(latin(d.startsAt)),
    endsAt: instantOf(latin(d.endsAt)),
    usageLimit: optional(d.usageLimit, intOf),
    perUserLimit: optional(d.perUserLimit, intOf),
  };
}

/** Field → constraint name, as catalog/client.ts `fieldErrors` reads the API's VALIDATION_FAILED. */
export type FieldErrors = Record<string, string>;
export const zodErrors = (e: z.ZodError): FieldErrors =>
  Object.fromEntries(e.issues.map((i) => [i.path.join('.'), i.code === 'custom' ? i.message : i.code]).reverse());

/** The message key of a field error (messages `coupons.errors.*`); `type` picks the value's wording. */
export function errorKey(field: string, constraint: string, type: CouponInput['type']): string {
  if (['endBeforeStart', 'taken', 'percent'].includes(constraint)) return constraint;
  if (field === 'value') return type === 'percent' ? 'percent' : 'amount';
  if (field.endsWith('Halalas')) return 'amount';
  if (field.endsWith('Limit')) return 'limit';
  if (field === 'startsAt' || field === 'endsAt') return 'date';
  return field === 'code' ? 'code' : 'invalid';
}
