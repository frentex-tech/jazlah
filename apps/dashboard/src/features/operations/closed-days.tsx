'use client';

import { CaretLeft, ClockCountdown, LockSimple, UsersThree, X } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormField, InputField, TextInput } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ClosedDaySchema, errorKey, zodErrors, type FieldErrors } from './schema';
import { SCOPES, type ClosedDay } from './types';

const ar = 'ar-SA-u-ca-gregory-nu-latn';
const fmt = (locale: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : ar, { ...o, timeZone: 'UTC' });
const utc = (date: string) => new Date(`${date}T00:00:00Z`);
/** «الجمعة 13 نوفمبر» (the frame's list rows); dates are Riyadh days, formatted as plain calendar dates. */
export const dayLabel = (date: string, locale: string) =>
  `${fmt(locale, { weekday: 'long' }).format(utc(date))} ${utc(date).getUTCDate()} ${fmt(locale, { month: 'long' }).format(utc(date))}`;

/**
 * The closed-days block of 118:11181: the month calendar (Saturday first; past days plain, today ember-outlined, closed
 * days danger with an ×) and beside it the legend, this month's closed days with their scope and reason, and «add».
 * Picking a coming day opens the add dialog on it. Full days are not marked: the API has no admin view of booked days.
 */
export function ClosedDays({ days, today, errors, onAdd, onRemove }: {
  days: ClosedDay[];
  today: string;
  errors: FieldErrors;
  onAdd: (d: ClosedDay) => void;
  onRemove: (date: string) => void;
}) {
  const t = useTranslations('operations.closed');
  const te = useTranslations('operations.errors');
  const locale = useLocale();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [adding, setAdding] = useState<string | null>(null);

  const first = utc(`${month}-01`);
  const length = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 1) % 7; // Saturday = 0
  const cells = [...Array<null>(offset).fill(null), ...Array.from({ length }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
  const closed = new Map(days.map((d) => [d.date, d]));
  const shift = (n: number) => setMonth(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + n, 1)).toISOString().slice(0, 7));
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt(locale, { weekday: locale === 'en' ? 'short' : 'long' }).format(new Date(Date.UTC(2026, 0, 3 + i)))); // 3 Jan 2026 is a Saturday; English full names collide in the 56 px columns
  const inMonth = days.map((d, i) => ({ d, i })).filter(({ d }) => d.date.startsWith(month));
  const label = (d: ClosedDay) => [dayLabel(d.date, locale), d.scope !== 'both' && t(`scope.${d.scope}`), locale === 'en' ? d.reasonEn : d.reasonAr].filter(Boolean).join(' · ');
  const nav = 'flex size-11 items-center justify-center rounded-pill border border-line bg-paper text-ink';

  return (
    <div className="flex gap-s32">
      <div className="flex w-[416px] shrink-0 flex-col gap-s12">
        <div className="flex h-11 items-center justify-between">
          <button type="button" aria-label={t('prev')} className={nav} onClick={() => shift(-1)}>
            <CaretLeft size={20} aria-hidden className="rtl:rotate-180" />
          </button>
          <h3 className="text-h3 text-ink" aria-live="polite">{fmt(locale, { month: 'long', year: 'numeric' }).format(first)}</h3>
          <button type="button" aria-label={t('next')} className={nav} onClick={() => shift(1)}>
            <CaretLeft size={20} aria-hidden className="ltr:rotate-180" />
          </button>
        </div>
        <div className="grid grid-cols-[repeat(7,56px)] gap-s4">
          {weekdays.map((w) => (
            <span key={w} aria-hidden className="text-center text-caption text-ink-2">{w}</span>
          ))}
          {cells.map((date, i) => {
            if (!date) return <span key={`e${i}`} />;
            const n = Number(date.slice(8));
            const c = closed.get(date);
            const base = 'flex h-11 flex-col items-center justify-center rounded-md text-label-m';
            if (c) {
              return (
                <span key={date} className={cn(base, 'bg-danger-bg text-danger')}>
                  {n}
                  <span className="sr-only">{t('closedMark')}</span>
                  <X size={14} aria-hidden />
                </span>
              );
            }
            if (date < today) return <span key={date} className={cn(base, 'text-ink-2')}>{n}</span>;
            return (
              <button
                key={date}
                type="button"
                aria-label={t('closeDay', { day: dayLabel(date, locale) })}
                onClick={() => setAdding(date)}
                className={cn(base, 'bg-paper text-ink', date === today ? 'border-2 border-ember' : 'border border-line')}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-[300px] shrink-0 flex-col gap-s16">
        <div className="flex flex-col gap-s8">
          <p className="text-label-m text-ink">{t('legend')}</p>
          {([['closed', LockSimple], ['full', UsersThree], ['cutoff', ClockCountdown]] as const).map(([k, IconCmp]) => (
            <div key={k} className="flex items-center gap-s12">
              <span className="flex size-7 items-center justify-center rounded-sm bg-sand"><IconCmp size={16} aria-hidden className="text-ink-2" /></span>
              <span className="text-body-m text-ink-2">{t(`legendItems.${k}`)}</span>
            </div>
          ))}
        </div>
        <p className="text-label-m text-ink">{t('month')}</p>
        {inMonth.length === 0 && <p className="text-body-m text-muted">{t('none')}</p>}
        <ul className="flex flex-col gap-s16">
          {inMonth.map(({ d, i }) => {
            const err = Object.entries(errors).find(([k]) => k.startsWith(`closedDays.${i}.`) || k === `closedDays.${i}`);
            return (
              <li key={d.date} className="flex min-h-11 flex-col justify-center">
                <div className="flex items-center justify-between gap-s12">
                  <span className="text-body-m text-ink-2">{label(d)}</span>
                  <button type="button" aria-label={t('remove', { day: label(d) })} onClick={() => onRemove(d.date)} className="shrink-0 text-ink-2">
                    <X size={20} aria-hidden />
                  </button>
                </div>
                {err && <p role="alert" className="text-body-m text-danger">{te(errorKey(err[0], err[1]))}</p>}
              </li>
            );
          })}
        </ul>
        <Button variant="secondary" size="S" className="self-start" onClick={() => setAdding(today)}>{t('add')}</Button>
      </div>

      {adding && <AddDialog key={adding} date={adding} today={today} taken={closed} onClose={() => setAdding(null)} onAdd={(d) => { onAdd(d); setMonth(d.date.slice(0, 7)); setAdding(null); }} />}
    </div>
  );
}

function AddDialog({ date, today, taken, onClose, onAdd }: { date: string; today: string; taken: Map<string, ClosedDay>; onClose: () => void; onAdd: (d: ClosedDay) => void }) {
  const t = useTranslations('operations.closed.dialog');
  const ts = useTranslations('operations.closed.scopes');
  const te = useTranslations('operations.errors');
  const [v, setV] = useState<ClosedDay>({ date, scope: 'both', reasonAr: '', reasonEn: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const err = (k: keyof ClosedDay) => {
    const c = errors[k];
    if (!c) return undefined;
    return c === 'taken' ? t('taken') : te(errorKey(k === 'date' ? 'closedDays' : `closedDays.0.${k}`, c));
  };
  const set = (k: keyof ClosedDay, value: string) => {
    setV((o) => ({ ...o, [k]: value }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  function confirm() {
    const parsed = ClosedDaySchema.safeParse(v);
    const e: FieldErrors = parsed.success ? {} : zodErrors(parsed.error);
    if (!e.date && v.date < today) e.date = 'notPast';
    if (!e.date && taken.has(v.date)) e.date = 'taken';
    if (Object.keys(e).length || !parsed.success) return setErrors(e);
    onAdd(parsed.data);
  }

  return (
    <ConfirmDialog open onOpenChange={(o) => !o && onClose()} title={t('title')} confirmLabel={t('confirm')} wide onConfirm={confirm}>
      <FormField label={t('date')} error={err('date')}>
        {({ id, describedBy, invalid }) => (
          <TextInput id={id} type="date" min={today} dir="ltr" className="rtl:text-end" aria-describedby={describedBy} invalid={invalid} value={v.date} onChange={(e) => set('date', e.target.value)} />
        )}
      </FormField>
      <FormField label={t('scope')}>
        {({ id }) => (
          <Select id={id} className="w-full" value={v.scope} onChange={(e) => set('scope', e.target.value)}>
            {SCOPES.map((s) => <option key={s} value={s}>{ts(s)}</option>)}
          </Select>
        )}
      </FormField>
      <InputField label={t('reasonAr')} error={err('reasonAr')} maxLength={100} dir="rtl" value={v.reasonAr} onChange={(e) => set('reasonAr', e.target.value)} />
      <InputField label={t('reasonEn')} error={err('reasonEn')} maxLength={100} dir="ltr" value={v.reasonEn} onChange={(e) => set('reasonEn', e.target.value)} />
    </ConfirmDialog>
  );
}
