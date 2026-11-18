'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, RowActionsTrigger, type TableStatus } from '@/components/ui/data-table';
import { FormField, InputField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { StatePanel } from '@/components/ui/state-panel';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Polygon, Position } from './geo';
import type { MapMode } from './zone-map';
import { CITIES, ZONE_COLORS, ZONE_COLOR_NAMES, type CoverageCheck, type CoverageZone, type ZoneInput } from './types';

const ZoneMap = dynamic(() => import('./zone-map').then((m) => m.ZoneMap), { ssr: false });

const PAGE_SIZE = 10;
const formSchema = z.object({
  nameAr: z.string().trim().min(1).max(80),
  nameEn: z.string().trim().min(1).max(80),
  city: z.enum(CITIES),
  color: z.enum(ZONE_COLORS),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;
const blank: FormValues = { nameAr: '', nameEn: '', city: 'riyadh', color: ZONE_COLORS[0], isActive: true };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error('api'), { code: (body as { code?: string } | null)?.code ?? 'NETWORK' });
  return body as T;
}

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

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: blank });
  const selected = zones.find((z) => z.id === selectedId);
  const editing = !!selected || !!shape; // the form shows for a selected zone or a newly drawn one

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setZones(await api<CoverageZone[]>('/api/coverage/zones'));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);
  useEffect(() => void load(), [load]);

  function select(id: string) {
    const z = zones.find((x) => x.id === id);
    if (!z) return;
    setSelectedId(id);
    setShape(undefined);
    setMode('view');
    setSaveError(undefined);
    form.reset({ nameAr: z.nameAr, nameEn: z.nameEn, city: z.city as FormValues['city'], color: z.color as FormValues['color'], isActive: z.isActive });
  }

  function reset() {
    setSelectedId(undefined);
    setShape(undefined);
    setMode('view');
    setSaveError(undefined);
    form.reset(blank);
  }

  function startDrawing() {
    reset();
    setTestPoint(undefined);
    setTestResult(undefined);
    setMode('draw');
  }

  const save = form.handleSubmit(async (values) => {
    const polygon = shape ?? selected?.polygon;
    if (!polygon) return;
    setBusy(true);
    setSaveError(undefined);
    const body: ZoneInput = { ...values, polygon };
    try {
      const saved = selected
        ? await api<CoverageZone>(`/api/coverage/zones/${selected.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await api<CoverageZone>('/api/coverage/zones', { method: 'POST', body: JSON.stringify(body) });
      setZones((zs) => (selected ? zs.map((z) => (z.id === saved.id ? saved : z)) : [...zs, saved]));
      setSelectedId(saved.id);
      setShape(undefined);
      setMode('view');
    } catch (e) {
      setSaveError((e as { code?: string }).code === 'INVALID_POLYGON' ? t('errors.invalidPolygon') : tt('state.error.body'));
    } finally {
      setBusy(false);
    }
  });

  async function remove() {
    if (!selected) return;
    setBusy(true);
    try {
      await api(`/api/coverage/zones/${selected.id}`, { method: 'DELETE' });
      setZones((zs) => zs.filter((z) => z.id !== selected.id));
      setConfirmDelete(false);
      reset();
    } catch {
      setSaveError(tt('state.error.body'));
    } finally {
      setBusy(false);
    }
  }

  async function testAt(p: Position) {
    setTestPoint(p);
    setTestResult(undefined);
    try {
      setTestResult(await api<CoverageCheck>(`/api/coverage/check?lat=${p[1]}&lng=${p[0]}&lang=${locale}`));
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
            {c.row.original.nameAr}
          </span>
        ),
      },
      { id: 'nameEn', accessorKey: 'nameEn', header: t('nameEn'), meta: { width: 300 } },
      { id: 'city', header: t('city'), meta: { width: 200 }, cell: (c) => t(`cities.${c.row.original.city as FormValues['city']}`) },
      {
        id: 'status', header: t('status'), meta: { width: 200 },
        cell: (c) => (c.row.original.isActive ? <Badge type="success">{t('active')}</Badge> : <Badge type="neutral">{t('inactive')}</Badge>),
      },
    ],
    [t],
  );

  const color = form.watch('color');
  const draft = useMemo(() => (shape && !selected ? { polygon: shape, color } : undefined), [shape, selected, color]);

  const pageRows = zones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const testText =
    testResult === 'error'
      ? tt('state.error.body')
      : testResult?.covered
        ? t('test.covered', { zone: testResult.zone?.name ?? '' })
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
              <InputField label={t('nameAr')} {...form.register('nameAr')} error={form.formState.errors.nameAr && tt('form.required')} />
              <InputField label={t('nameEn')} dir="ltr" {...form.register('nameEn')} error={form.formState.errors.nameEn && tt('form.required')} />
              <FormField label={t('city')}>
                {({ id }) => (
                  <Controller
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <Select id={id} className="h-[52px] w-full" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{t(`cities.${c}`)}</option>
                        ))}
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <div className="flex flex-col gap-s8">
                <span className="text-label-m text-ink-2">{t('color')}</span>
                <Controller
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <div role="radiogroup" aria-label={t('color')} className="flex h-[52px] items-center gap-s12">
                      {ZONE_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={field.value === c}
                          aria-label={t(`colors.${ZONE_COLOR_NAMES[c]!}`)}
                          onClick={() => field.onChange(c)}
                          className={cn('size-8 rounded-pill border-2 ring-1 ring-line', field.value === c ? 'border-ink' : 'border-paper')}
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
        rowActions={(z) => <RowActionsTrigger aria-label={t('selectZone', { zone: z.nameAr })} onClick={() => select(z.id)} />}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        loading={busy}
        title={t('deleteDialog.title')}
        body={t('deleteDialog.body', { zone: selected?.nameAr ?? '' })}
        onConfirm={() => void remove()}
      />
    </>
  );
}
