'use client';

import { Clock, Info, PauseCircle, PlayCircle } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { BackButton } from '@/components/shell/back-button';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, InputField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { fieldErrors } from '@/features/catalog/client';
import { riyadhToday } from '@/lib/date';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { ClosedDays } from './closed-days';
import { PauseDialog, pauseErrors, usePause } from './pause';
import { errorKey, fromDraft, PageSchema, PausedSchema, toDraft, zodErrors, type Draft, type FieldErrors } from './schema';
import { SettingsTabs } from './settings-tabs';
import { ORDER_TYPES, type OperationsSettings, type Paused } from './types';

const URL = '/api/admin/settings/operations';
const grid = 'grid grid-cols-[repeat(2,342px)] gap-x-s24 gap-y-s20';
/** Options of the weekly hours selects: every half hour. */
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

/** «8:00 ص» / «8:00 AM», as the frame's hour selects. */
export function clock(hhmm: string, locale: string) {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const day = h < 12;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${locale === 'en' ? (day ? 'AM' : 'PM') : day ? 'ص' : 'م'}`;
}

const get = (o: unknown, path: string) => path.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown> | undefined)?.[k], o);
function set<T>(o: T, path: string, value: unknown): T {
  const [k, ...rest] = path.split('.');
  const copy = (Array.isArray(o) ? [...o] : { ...o }) as Record<string, unknown>;
  copy[k!] = rest.length ? set(copy[k!], rest.join('.'), value) : value;
  return copy as T;
}

/**
 * SCH-DSH-1: «الإعدادات التشغيلية» (118:11181 and its states 118:11833 paused, 118:12270 pause confirmation, 118:12702
 * loading, 118:12773 error, 118:12848 validation, 118:13416 not allowed). One save sends every section; the pause
 * switch acts at once (with its confirmation), as the header switch does.
 */
export function OperationsSettingsPage() {
  const t = useTranslations('operations');
  const te = useTranslations('operations.errors');
  const locale = useLocale();
  const pause = usePause();
  const [state, setState] = useState<OperationsSettings | 'loading' | 'error' | 'denied'>('loading');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // The card's messages: what pausing from the card sends. They follow the shared pause state (header or page), and
  // the page save never sends them: only the pause flow changes `paused`.
  const [msg, setMsg] = useState({ messageAr: '', messageEn: '' });
  const { sync } = pause;
  useEffect(() => {
    if (!pause.paused) return;
    setMsg({ messageAr: pause.paused.messageAr, messageEn: pause.paused.messageEn });
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('paused.'))));
  }, [pause.paused]);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const s = await panelFetch<OperationsSettings>('admin', URL);
      setState(s);
      setDraft(toDraft(s));
      setErrors({});
      sync(s.paused);
    } catch (e) {
      setState(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, [sync]);
  useEffect(() => void load(), [load]);

  const header = (
    <>
      <PageHeader breadcrumb={t('breadcrumb')} title={t('title')} />
      <SettingsTabs current="operations" />
    </>
  );
  if (typeof state !== 'object' || !draft) {
    return (
      <>
        {header}
        {state === 'error' && <StateCard kind="error" className="h-[374px]" title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />}
        {state === 'denied' && <StateCard kind="denied" className="h-[404px]" title={t('denied.title')} body={t('denied.body')} action={<BackButton label={t('denied.action')} panel="admin" />} />}
        {state === 'loading' && (
          <div role="status" aria-label={t('loading')} className="flex w-full flex-col gap-s24">
            {[200, 400, 280, 440, 320].map((h) => <Skeleton key={h} style={{ height: h }} />)}
          </div>
        )}
      </>
    );
  }

  const d = draft;
  const paused = pause.paused ?? state.paused;
  const today = riyadhToday();
  const err = (path: string) => (errors[path] ? te(errorKey(path, errors[path]!)) : undefined);
  const invalid = (...prefixes: string[]) => Object.keys(errors).some((k) => prefixes.some((p) => k === p || k.startsWith(`${p}.`)));
  const edit = (path: string, value: unknown) => {
    setDraft((o) => set(o!, path, value));
    // A change clears the field's error and its siblings' (an «end before start» belongs to both).
    // Removing a closed day shifts the indexes: every `closedDays.*` error goes.
    const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.') + 1) : `${path}.`;
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !(k === path || k.startsWith(parent)))));
  };
  const text = (path: string, label: string, hint?: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <InputField label={label} hint={hint} error={err(path)} value={get(d, path) as string} onChange={(e) => edit(path, e.target.value)} {...extra} />
  );
  const timeInput = (path: string, label: string) => text(path, label, t('riyadh'), { dir: 'ltr', className: 'rtl:text-end', placeholder: 'HH:MM', maxLength: 5 });
  const numInput = (path: string, label: string, hint?: string) => text(path, label, hint, { inputMode: 'numeric' });
  const moneyInput = (path: string, label: string, hint?: string) => text(path, label, hint, { inputMode: 'decimal' });

  function failed(e: unknown) {
    const fields = fieldErrors(e);
    if (fields) {
      setErrors(fields);
      toast('error', t('invalid'));
    } else if (e instanceof ApiError && e.code === 'NOT_ALLOWED') setState('denied');
    else toast('error', t('failed'));
  }

  async function save() {
    const parsed = PageSchema.safeParse(fromDraft(d));
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      return toast('error', t('invalid'));
    }
    setSaving(true);
    try {
      const s = await panelFetch<OperationsSettings>('admin', URL, { method: 'PUT', body: JSON.stringify(parsed.data) });
      setState(s);
      setDraft(toDraft(s));
      setErrors({});
      sync(s.paused);
      toast('success', t('saved'));
    } catch (e) {
      failed(e);
    } finally {
      setSaving(false);
    }
  }

  const preview = (() => {
    const s = fromDraft(d).deliveryWindow;
    if (!/^\d\d:\d\d$/.test(s.start) || !/^\d\d:\d\d$/.test(s.end)) return '—';
    const short = (v: string) => clock(v, locale).split(' ')[0]!.replace(':00', '');
    return t('delivery.previewText', { from: short(s.start), to: short(s.end), period: Number(s.end.slice(0, 2)) < 12 ? 'am' : 'pm' });
  })();

  return (
    <>
      {header}
      <form
        noValidate
        className="flex w-full flex-col gap-s24"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <PauseCard
          paused={paused}
          draft={msg}
          error={err}
          invalid={invalid('paused')}
          onMessage={(k, v) => {
            setMsg((m) => ({ ...m, [k]: v }));
            setErrors(({ [`paused.${k}`]: _, ...rest }) => rest);
          }}
          onToggle={() => {
            // Pausing sends the card's messages: refused ones show on the card before any dialog.
            const check = PausedSchema.safeParse({ ...msg, isPaused: true });
            if (!paused.isPaused && !check.success) {
              const e = zodErrors(check.error);
              return setErrors((o) => ({ ...o, ...Object.fromEntries(Object.entries(e).map(([k, v]) => [`paused.${k}`, v])) }));
            }
            setConfirming(true);
          }}
        />

        {d.workingHours && (
        <FormSection hug title={t('hours.title')} body={t('hours.body')} invalid={invalid('workingHours')}>
          {d.workingHours.map((h, i) => {
            const day = t(`hours.days.${h.day}`);
            const hourSelect = (k: 'start' | 'end') => (
              <Select
                aria-label={t(`hours.${k}Label`, { day })}
                className="w-[200px]"
                disabled={!h.open}
                value={h.open ? h[k] : ''}
                onChange={(e) => edit(`workingHours.${i}.${k}`, e.target.value)}
              >
                {!h.open && <option value="">—</option>}
                {HALF_HOURS.map((v) => <option key={v} value={v}>{clock(v, locale)}</option>)}
              </Select>
            );
            return (
              <div key={h.day} className="flex flex-col gap-s8">
                <div className="flex items-center gap-s16">
                  <div className="w-[210px] whitespace-nowrap">
                    <Switch label={t(h.open ? 'hours.open' : 'hours.closed', { day })} checked={h.open} onChange={(v) => edit(`workingHours.${i}.open`, v)} />
                  </div>
                  <span className="w-s32 text-body-m text-ink-2">{t('hours.from')}</span>
                  {hourSelect('start')}
                  <span className="w-s32 text-body-m text-ink-2">{t('hours.to')}</span>
                  {hourSelect('end')}
                </div>
                {err(`workingHours.${i}.end`) && <p role="alert" className="text-body-m text-danger">{err(`workingHours.${i}.end`)}</p>}
              </div>
            );
          })}
        </FormSection>
        )}

        <FormSection hug title={t('capacity.title')} body={t('capacity.body')} invalid={invalid('capacity', 'cutoffs')}>
          <div className={grid}>
            {numInput('capacity.ordersPerDay', t('capacity.orders'), t('capacity.hint'))}
            {numInput('capacity.carcassesPerDay', t('capacity.carcasses'), t('capacity.hint'))}
            {ORDER_TYPES.map((k) => <div key={k}>{timeInput(`cutoffs.${k}.time`, t('capacity.cutoff', { type: t(`types.${k}`) }))}</div>)}
            {ORDER_TYPES.map((k) => <div key={k}>{numInput(`cutoffs.${k}.leadDays`, t('capacity.lead', { type: t(`types.${k}`) }), t('capacity.leadHint'))}</div>)}
          </div>
          <p className="flex items-center gap-s8 text-body-m text-ink-2">
            <Info size={20} aria-hidden className="shrink-0 text-info" />
            {t('capacity.timezone')}
          </p>
        </FormSection>

        <FormSection hug title={t('closed.title')} body={t('closed.body')} invalid={invalid('closedDays')}>
          <ClosedDays
            days={d.closedDays}
            today={today}
            errors={errors}
            onAdd={(c) => edit('closedDays', [...d.closedDays, c].sort((a, b) => a.date.localeCompare(b.date)))}
            onRemove={(date) => edit('closedDays', d.closedDays.filter((c) => c.date !== date))}
          />
        </FormSection>

        <FormSection hug title={t('delivery.title')} body={t('delivery.body')} invalid={invalid('deliveryWindow', 'bookingHorizonDays')}>
          <div className={grid}>
            {timeInput('deliveryWindow.start', t('delivery.start'))}
            {timeInput('deliveryWindow.end', t('delivery.end'))}
            {numInput('bookingHorizonDays', t('delivery.horizon'), t('delivery.horizonHint'))}
            <div className="flex flex-col gap-s8">
              <p className="text-label-m text-ink-2">{t('delivery.preview')}</p>
              <div className="flex items-center gap-s12 rounded-md border border-line bg-paper px-s16 py-s12">
                <Clock size={24} aria-hidden className="shrink-0 text-ember" />
                <div className="flex flex-col gap-[2px]">
                  <p className="text-body-l text-ink">{preview}</p>
                  <p className="text-body-m text-ink-2">{t('riyadh')}</p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection hug title={t('fees.title')} body={t('fees.body')} invalid={invalid('minOrderHalalas', 'deliveryFeeHalalas')}>
          <div className={grid}>
            {moneyInput('minOrderHalalas', t('fees.minOrder'), t('fees.minOrderHint'))}
            {moneyInput('deliveryFeeHalalas', t('fees.fee'), t('fees.feeHint'))}
          </div>
        </FormSection>

        <FormSection hug title={t('cod.title')} body={t('cod.body')} invalid={invalid('cod')}>
          <Switch label={t('cod.enabled')} checked={d.cod.enabled} onChange={(v) => edit('cod.enabled', v)} />
          <div className={grid}>
            {moneyInput('cod.maxOrderHalalas', t('cod.max'), t('cod.maxHint'))}
            <FormField label={t('cod.confirmation')} hint={t(`cod.confirmationHint.${d.cod.confirmation}`)}>
              {({ id, describedBy }) => (
                <Select id={id} aria-describedby={describedBy} className="h-[52px] w-full" value={d.cod.confirmation} onChange={(e) => edit('cod.confirmation', e.target.value)}>
                  <option value="auto">{t('cod.auto')}</option>
                  <option value="review">{t('cod.review')}</option>
                </Select>
              )}
            </FormField>
          </div>
          <fieldset className="flex flex-col gap-s8">
            <legend className="mb-s8 text-label-m text-ink-2">{t('cod.types')}</legend>
            <div className="flex flex-wrap gap-s24">
              {ORDER_TYPES.map((k) => (
                <Checkbox
                  key={k}
                  label={t(`types.${k}`)}
                  checked={d.cod.allowedOrderTypes.includes(k)}
                  onChange={(v) => edit('cod.allowedOrderTypes', v ? ORDER_TYPES.filter((o) => o === k || d.cod.allowedOrderTypes.includes(o)) : d.cod.allowedOrderTypes.filter((o) => o !== k))}
                />
              ))}
            </div>
          </fieldset>
        </FormSection>

        <FormSection hug title={t('complaints.title')} body={t('complaints.body')} invalid={invalid('complaintWindowHours')}>
          <div className={grid}>{numInput('complaintWindowHours', t('complaints.hours'), t('complaints.hint'))}</div>
        </FormSection>

        <div className="flex justify-end gap-s12 rounded-md border border-line bg-paper px-s24 py-s16">
          <Button type="submit" loading={saving}>{t('save')}</Button>
          <Button variant="secondary" disabled={saving} onClick={() => { setDraft(toDraft(state)); setErrors({}); }}>{t('cancel')}</Button>
        </div>
      </form>

      <PauseDialog
        open={confirming}
        onOpenChange={setConfirming}
        current={{ ...paused, ...msg }}
        onInvalid={(e) => setErrors((o) => ({ ...o, ...e }))}
        onConfirm={async (p) => {
          try {
            const s = await pause.apply(p);
            setState(s);
            setConfirming(false);
            toast('success', t(p.isPaused ? 'pause.pausedToast' : 'pause.resumedToast'));
          } catch (e) {
            const fields = pauseErrors(e, (k) => t(`pause.${k}`));
            setConfirming(false);
            if (fields) setErrors(fields);
          }
        }}
      />
    </>
  );
}

/** The pause card of 118:11181 (open, success badge, play icon) and 118:11833 (paused: warning card, pause icon). */
function PauseCard({ paused, draft, error, invalid, onMessage, onToggle }: {
  paused: Paused;
  draft: Pick<Paused, 'messageAr' | 'messageEn'>;
  error: (path: string) => string | undefined;
  invalid: boolean;
  onMessage: (k: 'messageAr' | 'messageEn', v: string) => void;
  onToggle: () => void;
}) {
  const t = useTranslations('operations.pause');
  const on = paused.isPaused;
  return (
    <section
      aria-label={t('section')}
      className={cn('flex w-full flex-col gap-s20 rounded-md p-s24', on ? 'border-2 border-warning bg-warning-bg' : 'border bg-paper', invalid ? 'border-danger' : !on && 'border-line')}
    >
      {/* 118:11181 / 118:11833: the switch and the message box on the start side, the icon and copy on the end side. */}
      <div className="flex items-center justify-between gap-s16">
        <Switch label={t('switch')} checked={on} onChange={onToggle} />
        <div className="flex items-center gap-s16">
          <span className={cn('flex size-[72px] shrink-0 items-center justify-center rounded-pill', on ? 'bg-paper' : 'bg-sand')}>
            {on ? <PauseCircle size={40} weight="fill" className="text-warning" aria-hidden /> : <PlayCircle size={40} weight="fill" className="text-success" aria-hidden />}
          </span>
          <div className="flex w-[640px] flex-col items-start gap-s8">
            <Badge type={on ? 'warning' : 'success'} size="M">{t(on ? 'badgePaused' : 'badgeOpen')}</Badge>
            <h2 className="font-display text-display-l text-ink">{t(on ? 'titlePaused' : 'titleOpen')}</h2>
            <p className="text-body-l text-ink-2">{t(on ? 'bodyPaused' : 'bodyOpen')}</p>
          </div>
        </div>
      </div>
      <div className="flex w-[374px] flex-col gap-s16 self-start rounded-md border border-line bg-paper p-s16">
        <InputField label={t('messageAr')} hint={t('messageHint')} error={error('paused.messageAr')} maxLength={200} dir="rtl" disabled={on} value={draft.messageAr} onChange={(e) => onMessage('messageAr', e.target.value)} />
        <InputField label={t('messageEn')} error={error('paused.messageEn')} maxLength={200} dir="ltr" disabled={on} value={draft.messageEn} onChange={(e) => onMessage('messageEn', e.target.value)} />
      </div>
    </section>
  );
}
