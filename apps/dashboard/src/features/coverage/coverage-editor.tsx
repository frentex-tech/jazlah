'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, RowActionsTrigger, type TableStatus } from '@/components/ui/data-table';
import { FormField, InputField } from '@/components/ui/form-field';
import { StatePanel } from '@/components/ui/state-panel';
import { Switch } from '@/components/ui/switch';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import type { Polygon, Position } from './geo';
import type { MapMode } from './zone-map';
import { COLOR_RE, ZONE_COLORS, ZONE_COLOR_NAMES, type CoverageCheck, type CoverageZone, type UpdateZone } from './types';

const ZoneMap = dynamic(() => import('./zone-map').then((m) => m.ZoneMap), { ssr: false });

const PAGE_SIZE = 10;
const DRAFT_KEY = 'jz:coverage-draft';
// City is free text, as written (Arabic expected by the API); these are suggestions only.
const CITY_SUGGESTIONS = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'];

const text = (max: number) => z.string().trim().min(1, 'required').min(2, 'tooShort').max(max, 'tooLong');
const formSchema = z.object({
  nameAr: text(100),
  nameEn: text(100),
  city: text(50),
  color: z.string().regex(COLOR_RE),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;
type FormField = keyof FormValues;
const blank: FormValues = { nameAr: '', nameEn: '', city: 'الرياض', color: ZONE_COLORS[0]!, isActive: true };
const valuesOf = (z: CoverageZone): FormValues => ({ nameAr: z.name.ar, nameEn: z.name.en, city: z.city, color: z.color, isActive: z.isActive });
/** API field (VALIDATION_FAILED details) → form field. */
const FIELD_OF: Record<string, FormField> = { 'name.ar': 'nameAr', 'name.en': 'nameEn', city: 'city', color: 'color', isActive: 'isActive' };

/** What the admin had not saved when the session ended; restored after signing in again. */
type Draft = { selectedId?: string; shape?: Polygon; values: FormValues };

/**
 * LOC-DSH-1: draw and manage delivery coverage. No Figma screen; built from Page header, Form section (16:1709),
 * Form actions (16:1711), Data table (16:1564), Switch (16:411), Badge and Map pin (16:923).
 */
export function CoverageEditor() {
  const t = useTranslations('coverage');
  const tt = useTranslations();
  const locale = useLocale();
  const [zones, setZones] = useState<CoverageZone[]>([]);
  const [status, setStatus] = useState<TableStatus>('loading');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [mode, setMode] = useState<MapMode>('view');
  const [shape, setShape] = useState<Polygon>();
  const [testPoint, setTestPoint] = useState<Position>();
  const [testResult, setTestResult] = useState<CoverageCheck | 'error'>();
  const [saveError, setSaveError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: blank });
  const selected = zones.find((z) => z.id === selectedId);
  const editing = !!selected || !!shape; // the form shows for a selected zone or a newly drawn one
  const nameOf = (z: CoverageZone) => (locale === 'en' ? z.name.en : z.name.ar);

  const shapeRef = useRef(shape);
  shapeRef.current = shape;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const keepDraft = useCallback(() => {
    if (!selectedRef.current && !shapeRef.current) return;
    const draft: Draft = { selectedId: selectedRef.current, shape: shapeRef.current, values: form.getValues() };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [form]);
  const call = useCallback(<T,>(url: string, init?: RequestInit) => panelFetch<T>('admin', url, { ...init, beforeSignIn: keepDraft }), [keepDraft]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await call<CoverageZone[]>('/api/coverage/zones');
      setZones(list);
      setStatus('ready');
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        sessionStorage.removeItem(DRAFT_KEY);
        const draft = JSON.parse(raw) as Draft;
        if (draft.selectedId && !list.some((z) => z.id === draft.selectedId)) return;
        setSelectedId(draft.selectedId);
        setShape(draft.shape);
        form.reset(draft.values);
        setRestored(true);
      }
    } catch {
      setStatus('error');
    }
  }, [call, form]);
  useEffect(() => void load(), [load]);

  function select(id: string) {
    const z = zones.find((x) => x.id === id);
    if (!z) return;
    setSelectedId(id);
    setShape(undefined);
    setMode('view');
    setSaveError(undefined);
    setRestored(false);
    form.reset(valuesOf(z));
  }

  function reset() {
    setSelectedId(undefined);
    setShape(undefined);
    setMode('view');
    setSaveError(undefined);
    setRestored(false);
    form.reset(blank);
  }

  function startDrawing() {
    reset();
    setTestPoint(undefined);
    setTestResult(undefined);
    setMode('draw');
  }

  function showError(e: unknown) {
    const err = e instanceof ApiError ? e : new ApiError('NETWORK');
    if (err.code === 'INVALID_POLYGON') return setSaveError(t('errors.invalidPolygon'));
    if (err.code === 'NOT_FOUND') {
      reset();
      void load();
      return setSaveError(t('errors.notFound'));
    }
    if (err.code === 'VALIDATION_FAILED' && Array.isArray(err.details)) {
      for (const d of err.details as { field?: string }[]) {
        const field = FIELD_OF[d.field ?? ''];
        if (field) form.setError(field, { message: 'invalid' });
      }
      return setSaveError(t('errors.validation'));
    }
    setSaveError(tt('state.error.body'));
  }

  const save = form.handleSubmit(async (v) => {
    const polygon = shape ?? selected?.polygon;
    if (!polygon) return;
    const name = { ar: v.nameAr.trim(), en: v.nameEn.trim() };
    // PATCH sends only what changed; the name goes with both languages together.
    let body: UpdateZone = { name, city: v.city.trim(), color: v.color, isActive: v.isActive, polygon };
    if (selected) {
      body = {
        ...((name.ar !== selected.name.ar || name.en !== selected.name.en) && { name }),
        ...(body.city !== selected.city && { city: body.city }),
        ...(v.color !== selected.color && { color: v.color }),
        ...(v.isActive !== selected.isActive && { isActive: v.isActive }),
        ...(shape && { polygon: shape }),
      };
      if (Object.keys(body).length === 0) return select(selected.id);
    }
    setBusy(true);
    setSaveError(undefined);
    try {
      const saved = selected
        ? await call<CoverageZone>(`/api/coverage/zones/${selected.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await call<CoverageZone>('/api/coverage/zones', { method: 'POST', body: JSON.stringify(body) });
      setZones((zs) => (selected ? zs.map((z) => (z.id === saved.id ? saved : z)) : [saved, ...zs]));
      setSelectedId(saved.id);
      setShape(undefined);
      setMode('view');
      setRestored(false);
      form.reset(valuesOf(saved));
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  });

  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      await call(`/api/coverage/zones/${selected.id}`, { method: 'DELETE' });
      setZones((zs) => zs.filter((z) => z.id !== selected.id));
      setConfirmDelete(false);
      reset();
    } catch (e) {
      setConfirmDelete(false);
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function testAt(p: Position) {
    setTestPoint(p);
    setTestResult(undefined);
    try {
      setTestResult(await call<CoverageCheck>(`/api/coverage/check?lat=${p[1]}&lng=${p[0]}`));
    } catch {
      setTestResult('error');
    }
  }

  const columns = useMemo<ColumnDef<CoverageZone, unknown>[]>(
    () => [
      {
        id: 'nameAr', header: t('nameAr'), meta: { width: 300 },
        cell: (c) => (
          <span className="flex items-center gap-s8">
            <span aria-hidden className="size-3 rounded-pill" style={{ background: c.row.original.color }} />
            {c.row.original.name.ar}
          </span>
        ),
      },
      { id: 'nameEn', header: t('nameEn'), meta: { width: 300 }, cell: (c) => <bdi>{c.row.original.name.en}</bdi> },
      { id: 'city', header: t('city'), meta: { width: 200 }, cell: (c) => c.row.original.city },
      {
        id: 'status', header: t('status'), meta: { width: 200 },
        cell: (c) => (c.row.original.isActive ? <Badge type="success">{t('active')}</Badge> : <Badge type="neutral">{t('inactive')}</Badge>),
      },
    ],
    [t],
  );

  const err = (f: FormField) => {
    const m = form.formState.errors[f]?.message;
    return m ? tt(m === 'required' || m === 'tooShort' || m === 'tooLong' ? `form.${m}` : 'form.invalid') : undefined;
  };
  const color = form.watch('color');
  const draft = useMemo(() => (shape && !selected ? { polygon: shape, color } : undefined), [shape, selected, color]);

  const pageRows = zones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const testText =
    testResult === 'error'
      ? tt('state.error.body')
      : testResult?.covered
        ? t('test.covered', { zone: testResult.zone ? (locale === 'en' ? testResult.zone.name.en : testResult.zone.name.ar) : '' })
        : testResult
          ? t('test.notCovered')
          : t('test.loading');

  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={
          <>
            <Button onClick={startDrawing} disabled={mode === 'draw'}>
              {t('newZone')}
            </Button>
            <Button
              variant="secondary"
              aria-pressed={mode === 'test'}
              className={cn(mode === 'test' && 'bg-sand')}
              onClick={() => {
                setTestPoint(undefined);
                setTestResult(undefined);
                setMode(mode === 'test' ? 'view' : 'test');
              }}
            >
              {mode === 'test' ? t('test.stop') : t('test.start')}
            </Button>
          </>
        }
      />

      <div className="relative h-[480px] w-full overflow-hidden rounded-md border border-line bg-sand">
        <ZoneMap
          zones={zones}
          selectedId={selectedId}
          mode={mode}
          editShape={shape ?? selected?.polygon}
          draft={draft}
          onSelect={select}
          onShape={(p) => {
            setShape(p);
            if (mode === 'draw') setMode('view');
          }}
          onTestPoint={(p) => void testAt(p)}
          testPoint={mode === 'test' ? testPoint : undefined}
          label={t('mapLabel')}
        />
        {(mode === 'draw' || mode === 'edit' || mode === 'test') && (
          <div className="absolute start-s16 top-s16 flex max-w-[420px] items-center gap-s12 rounded-md bg-paper px-s16 py-s12 shadow-card">
            <p className="flex-1 text-body-m text-ink">{t(`hints.${mode}`)}</p>
            {mode !== 'test' && (
              <Button variant="ghost" size="S" onClick={() => (selected ? select(selected.id) : reset())}>
                {tt('dialog.cancel')}
              </Button>
            )}
          </div>
        )}
        {mode === 'test' && testPoint && (
          <div role="status" className="absolute bottom-s16 start-s16 flex flex-col gap-s8 rounded-md bg-paper p-s16 shadow-card">
            {testResult && testResult !== 'error' ? (
              <Badge type={testResult.covered ? 'success' : 'danger'} size="M">{testText}</Badge>
            ) : (
              <p className="text-body-m text-ink-2">{testText}</p>
            )}
            <p dir="ltr" className="text-start text-caption text-muted">
              {testPoint[1].toFixed(5)}, {testPoint[0].toFixed(5)}
            </p>
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={save} className="flex w-full flex-col gap-s24" noValidate>
          <section className="flex w-full gap-s32 rounded-md border border-line bg-paper p-s24">
            <div className="flex w-[280px] shrink-0 flex-col gap-s8">
              <h2 className="text-h2 text-ink">{selected ? t('form.editTitle') : t('form.newTitle')}</h2>
              <p className="text-body-m text-ink-2">{t('form.body')}</p>
              {selected && mode !== 'edit' && (
                <Button variant="secondary" size="S" className="mt-s8 self-start" onClick={() => setMode('edit')}>
                  {t('form.editShape')}
                </Button>
              )}
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-s24 gap-y-s20">
              <InputField label={t('nameAr')} {...form.register('nameAr')} error={err('nameAr')} />
              <InputField label={t('nameEn')} dir="ltr" {...form.register('nameEn')} error={err('nameEn')} />
              <InputField
                label={t('city')}
                list="coverage-cities"
                hint={t('cityHint')}
                {...form.register('city')}
                error={err('city')}
              />
              <datalist id="coverage-cities">
                {CITY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div className="flex flex-col gap-s8">
                <span className="text-label-m text-ink-2">{t('color')}</span>
                <Controller
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <div role="radiogroup" aria-label={t('color')} className="flex h-[52px] items-center gap-s12">
                      {(ZONE_COLORS.includes(field.value.toUpperCase()) ? ZONE_COLORS : [field.value, ...ZONE_COLORS]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={field.value.toUpperCase() === c.toUpperCase()}
                          aria-label={ZONE_COLOR_NAMES[c.toUpperCase()] ? t(`colors.${ZONE_COLOR_NAMES[c.toUpperCase()]!}`) : t('colors.custom', { hex: c })}
                          onClick={() => field.onChange(c)}
                          className={cn('size-8 rounded-pill border-2 ring-1 ring-line', field.value.toUpperCase() === c.toUpperCase() ? 'border-ink' : 'border-paper')}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => <Switch label={t('activeToggle')} checked={field.value} onChange={field.onChange} />}
              />
            </div>
          </section>
          {restored && !saveError && (
            <p role="status" className="rounded-sm bg-info-bg px-s16 py-s12 text-body-m text-info">
              {t('restored')}
            </p>
          )}
          {saveError && (
            <p role="alert" className="rounded-sm bg-danger-bg px-s16 py-s12 text-body-m text-danger">
              {saveError}
            </p>
          )}
          <div className="flex w-full items-center justify-between rounded-md border border-line bg-paper px-s24 py-s16">
            <div className="flex gap-s12">
              <Button type="submit" loading={busy}>{tt('form.save')}</Button>
              <Button variant="secondary" onClick={reset}>{tt('dialog.cancel')}</Button>
            </div>
            {selected && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                {t('form.delete')}
              </Button>
            )}
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={pageRows}
        total={zones.length}
        page={page}
        pageSize={PAGE_SIZE}
        status={status}
        onPageChange={setPage}
        onRetry={() => void load()}
        empty={
          <StatePanel kind="search" title={t('empty.title')} body={t('empty.body')} action={<Button variant="secondary" onClick={startDrawing}>{t('newZone')}</Button>} />
        }
        rowActions={(z) => <RowActionsTrigger aria-label={t('selectZone', { zone: nameOf(z) })} onClick={() => select(z.id)} />}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        loading={busy}
        title={t('deleteDialog.title')}
        body={t('deleteDialog.body', { zone: selected ? nameOf(selected) : '' })}
        onConfirm={() => void remove()}
      />
    </>
  );
}
