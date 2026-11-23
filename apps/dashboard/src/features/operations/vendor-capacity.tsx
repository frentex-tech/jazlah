'use client';

import { X } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/components/shell/back-button';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { FormField, InputField, TextInput } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { StatePanel } from '@/components/ui/state-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { toast } from '@/components/ui/toast';
import { fieldErrors } from '@/features/catalog/client';
import { dayOf, riyadhToday } from '@/lib/date';
import { ApiError, failedState, NOT_IMPLEMENTED, panelFetch, PERMISSION_DENIED } from '@/lib/panel-fetch';
import { DayLimitSchema, errorKey, intOf, isDate, VendorDefaultSchema, zodErrors, type FieldErrors } from './schema';
import type { DayCapacity, OperationsSettings, VendorCapacity } from './types';

/** Empty → null (use the default), else a whole number (NaN when it is not one, refused by the schema). */
const limitOf = (s: string) => (s.trim() === '' ? null : intOf(s));
const text = (n: number | null) => (n === null ? '' : String(n));

/**
 * SCH-DSH-1 «per-vendor capacity»: the capacity tab of the admin vendor page. No Figma frame: built from the DS (Form
 * section, Input, Data table, Dialog) as the operations page (docs/design/signoff.md, pending). The vendor's default
 * overrides the platform's daily capacity; a specific date overrides both (SCH-API-2 `DayCapacity`).
 */
export function VendorCapacityTab({ vendorId }: { vendorId: string }) {
  const t = useTranslations('vendorCapacity');
  const te = useTranslations('operations.errors');
  const ts = useTranslations('state');
  const locale = useLocale();
  const [cap, setCap] = useState<VendorCapacity | 'loading' | 'error' | 'denied' | 'soon'>('loading');
  const [platform, setPlatform] = useState<OperationsSettings['defaultCapacity'] | null>(null);
  const [form, setForm] = useState({ ordersPerDay: '', carcassesPerDay: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const url = `/api/admin/vendors/${vendorId}/capacity`;

  const show = useCallback((c: VendorCapacity) => {
    setCap(c);
    setForm({ ordersPerDay: text(c.ordersPerDay), carcassesPerDay: text(c.carcassesPerDay) });
  }, []);
  const failed = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.code === PERMISSION_DENIED) setCap('denied');
    else toast('error', e instanceof ApiError && e.code === NOT_IMPLEMENTED ? ts('soon.toast') : t('failed'));
  }, [t, ts]);

  const load = useCallback(async () => {
    setCap('loading');
    try {
      show(await panelFetch<VendorCapacity>('admin', url));
    } catch (e) {
      setCap(failedState(e));
    }
    // The platform default is only a hint here: without it the hint is generic.
    panelFetch<OperationsSettings>('admin', '/api/admin/settings/operations').then((s) => setPlatform(s.defaultCapacity), () => setPlatform(null));
  }, [url, show]);
  useEffect(() => void load(), [load]);

  const removeDay = useCallback(async (date: string) => {
    try {
      show(await panelFetch<VendorCapacity>('admin', `${url}/${date}`, { method: 'DELETE' }));
      toast('success', t('dayRemoved'));
    } catch (e) {
      failed(e);
    }
  }, [url, show, failed, t]);

  const columns = useMemo<ColumnDef<DayCapacity, unknown>[]>(() => {
    const limit = (n: number | null) => (n === null ? t('useDefault') : String(n));
    return [
      { id: 'date', header: t('date'), cell: (c) => dayOf(`${c.row.original.date}T12:00:00+03:00`, locale) },
      { id: 'orders', header: t('ordersLimit'), meta: { width: 180 }, cell: (c) => limit(c.row.original.ordersLimit) },
      { id: 'carcasses', header: t('carcassesLimit'), meta: { width: 180 }, cell: (c) => limit(c.row.original.carcassesLimit) },
      { id: 'booked', header: t('booked'), meta: { width: 180 }, cell: (c) => t('bookedValue', { orders: c.row.original.ordersBooked, carcasses: c.row.original.carcassesBooked }) },
    ];
  }, [t, locale]);

  if (cap === 'loading') {
    return (
      <div role="status" aria-label={t('loading')} className="flex w-full flex-col gap-s24">
        <Skeleton className="h-[220px]" />
        <Skeleton className="h-[280px]" />
      </div>
    );
  }
  if (cap === 'error') return <StateCard kind="error" className="h-[374px]" title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />;
  if (cap === 'soon') return <StateCard kind="soon" className="h-[404px]" title={ts('soon.title')} body={ts('soon.body')} />;
  if (cap === 'denied') return <StateCard kind="denied" className="h-[404px]" title={t('denied.title')} body={t('denied.body')} action={<BackButton label={t('denied.action')} panel="admin" />} />;

  const err = (k: string) => (errors[k] ? te(errorKey(k, errors[k]!)) : undefined);
  const hint = (k: 'ordersPerDay' | 'carcassesPerDay') => (platform ? t('platformHint', { n: platform[k] }) : t('platformHintGeneric'));

  async function saveDefault() {
    const parsed = VendorDefaultSchema.safeParse({ ordersPerDay: limitOf(form.ordersPerDay), carcassesPerDay: limitOf(form.carcassesPerDay) });
    if (!parsed.success) return setErrors(zodErrors(parsed.error));
    setSaving(true);
    try {
      show(await panelFetch<VendorCapacity>('admin', url, { method: 'PUT', body: JSON.stringify(parsed.data) }));
      setErrors({});
      toast('success', t('saved'));
    } catch (e) {
      const fields = fieldErrors(e);
      if (fields) setErrors(fields);
      else failed(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <FormSection hug title={t('default.title')} body={t('default.body')} invalid={Object.keys(errors).length > 0}>
        <div className="grid grid-cols-[repeat(2,342px)] gap-x-s24 gap-y-s20">
          {(['ordersPerDay', 'carcassesPerDay'] as const).map((k) => (
            <InputField
              key={k}
              label={t(`default.${k}`)}
              hint={hint(k)}
              error={err(k)}
              inputMode="numeric"
              value={form[k]}
              onChange={(e) => {
                setForm((f) => ({ ...f, [k]: e.target.value }));
                setErrors(({ [k]: _, ...rest }) => rest);
              }}
            />
          ))}
        </div>
        <Button className="self-start" loading={saving} onClick={() => void saveDefault()}>{t('default.save')}</Button>
      </FormSection>

      <FormSection hug title={t('days.title')} body={t('days.body')}>
        <DataTable
          columns={columns}
          data={cap.days}
          status="ready"
          label={t('days.title')}
          hasPrev={false}
          hasNext={false}
          onPrev={() => {}}
          onNext={() => {}}
          empty={<StatePanel kind="orders" title={t('days.emptyTitle')} body={t('days.emptyBody')} />}
          rowActions={(d) => (
            <button type="button" aria-label={t('days.remove', { date: dayOf(`${d.date}T12:00:00+03:00`, locale) })} onClick={() => void removeDay(d.date)} className="flex items-center text-ink-2">
              <X size={20} aria-hidden />
            </button>
          )}
        />
        <Button variant="secondary" size="S" className="self-start" onClick={() => setAdding(true)}>{t('days.add')}</Button>
      </FormSection>

      {adding && <AddDayDialog url={url} onClose={() => setAdding(false)} onSaved={(c) => { show(c); setAdding(false); toast('success', t('daySaved')); }} onFailed={failed} />}
    </>
  );
}

function AddDayDialog({ url, onClose, onSaved, onFailed }: { url: string; onClose: () => void; onSaved: (c: VendorCapacity) => void; onFailed: (e: unknown) => void }) {
  const t = useTranslations('vendorCapacity.dialog');
  const te = useTranslations('operations.errors');
  const today = riyadhToday();
  const [v, setV] = useState({ date: today, ordersLimit: '', carcassesLimit: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const err = (k: string) => (errors[k] ? te(errorKey(k === 'date' ? 'closedDays' : k, errors[k]!)) : undefined);
  const set = (k: keyof typeof v, value: string) => {
    setV((o) => ({ ...o, [k]: value }));
    setErrors(({ [k]: _, ...rest }) => rest);
  };

  async function confirm() {
    const parsed = DayLimitSchema.safeParse({ ordersLimit: limitOf(v.ordersLimit), carcassesLimit: limitOf(v.carcassesLimit) });
    const e: FieldErrors = parsed.success ? {} : zodErrors(parsed.error);
    if (!isDate(v.date)) e.date = 'invalid';
    else if (v.date < today) e.date = 'notPast';
    if (!parsed.success || Object.keys(e).length) return setErrors(e);
    setBusy(true);
    try {
      onSaved(await panelFetch<VendorCapacity>('admin', `${url}/${v.date}`, { method: 'PUT', body: JSON.stringify(parsed.data) }));
    } catch (x) {
      const fields = fieldErrors(x);
      if (fields) setErrors(fields);
      else {
        onClose();
        onFailed(x);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog open onOpenChange={(o) => !o && !busy && onClose()} title={t('title')} body={t('body')} confirmLabel={t('confirm')} loading={busy} wide onConfirm={() => void confirm()}>
      <FormField label={t('date')} error={err('date')}>
        {({ id, describedBy, invalid }) => (
          <TextInput id={id} type="date" min={today} dir="ltr" className="rtl:text-end" aria-describedby={describedBy} invalid={invalid} value={v.date} onChange={(e) => set('date', e.target.value)} />
        )}
      </FormField>
      <InputField label={t('ordersLimit')} hint={t('limitHint')} error={err('ordersLimit')} inputMode="numeric" value={v.ordersLimit} onChange={(e) => set('ordersLimit', e.target.value)} />
      <InputField label={t('carcassesLimit')} hint={t('limitHint')} error={err('carcassesLimit')} inputMode="numeric" value={v.carcassesLimit} onChange={(e) => set('carcassesLimit', e.target.value)} />
    </ConfirmDialog>
  );
}
