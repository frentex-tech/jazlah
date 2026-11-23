'use client';

import { CalendarBlank } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackButton } from '@/components/shell/back-button';
import { PageHeader } from '@/components/shell/page-header';
import { PanelLoading } from '@/components/shell/panel-loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import type { Vendor } from '@/features/admin-vendors/types';
import { Link } from '@/i18n/navigation';
import { sar } from '@/lib/money';
import { failedState, panelFetch } from '@/lib/panel-fetch';
import type { OrdersPanel } from './backend';
import { pollFeed, streamFeed } from './feed';
import { BADGE, dateOf, nameOf } from './format';
import { METHODS, STATUSES, type OrderStatus, type OrderSummary, type Page, type PaymentMethod } from './types';

type Data = { rows: OrderSummary[]; next: string | null } | 'loading' | 'error' | 'denied' | 'soon';

/**
 * ORD-DSH-1: the orders board of both panels (135:47501 and its states). Vendors get their own orders (the API scopes
 * them); admins get every order and a store filter. New orders arrive live (`live`: pushed by the server, else polled)
 * and are tinted for a moment.
 */
export function OrdersList({ panel, live }: { panel: OrdersPanel; live: boolean }) {
  const t = useTranslations('orders');
  const ts = useTranslations('state');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [vendorId, setVendorId] = useState('');
  const [date, setDate] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [paging, setPaging] = useState<{ key: string; cursors: (string | undefined)[] }>({ key: '', cursors: [undefined] });
  const [data, setData] = useState<Data>('loading');
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim().slice(0, 100)), 300);
    return () => clearTimeout(id);
  }, [search]);
  // shortcut: the store filter offers the first page of active stores, API gap (no store names lookup for orders) (#88).
  useEffect(() => {
    if (panel !== 'admin') return;
    panelFetch<Page<Vendor>>('admin', '/api/admin/vendors?status=active').then((p) => setVendors(p.items), () => {});
  }, [panel]);

  const key = `${status}|${method}|${vendorId}|${date}|${q}`;
  const cursors = paging.key === key ? paging.cursors : [undefined];
  const setCursors = (next: (string | undefined)[]) => setPaging({ key, cursors: next });
  const cursor = cursors[cursors.length - 1];
  // Only the latest request may set the list: a quiet live reload under old filters must not overwrite newer results.
  const latest = useRef(0);
  const load = useCallback(
    async (quiet = false) => {
      const req = ++latest.current;
      if (!quiet) setData('loading');
      const query = new URLSearchParams({ ...(status && { status }), ...(method && { paymentMethod: method }), ...(vendorId && { vendorId }), ...(date && { fulfilmentDate: date }), ...(q && { q }), ...(cursor && { cursor }) });
      try {
        const p = await panelFetch<Page<OrderSummary>>(panel, `/api/${panel}/orders?${query}`);
        if (req === latest.current) setData({ rows: p.items, next: p.nextCursor });
      } catch (e) {
        if (!quiet && req === latest.current) setData(failedState(e));
      }
    },
    [panel, status, method, vendorId, date, q, cursor],
  );
  useEffect(() => void load(), [load]);

  // Live inserts: on the first page the list reloads quietly (so the filters still apply) and the new row is tinted.
  const onFirstPage = useRef(true);
  onFirstPage.current = cursors.length === 1;
  const reload = useRef(load);
  reload.current = load;
  useEffect(() => {
    const feed = live ? streamFeed(panel) : pollFeed(panel);
    return feed.subscribe(
      (o) => {
        setAnnounce(t('fresh', { number: o.number }));
        if (!onFirstPage.current) return;
        setFresh((s) => new Set(s).add(o.id));
        setTimeout(() => setFresh((s) => (s.delete(o.id), new Set(s))), 6000);
        void reload.current(true);
      },
      undefined,
      // A status changed elsewhere: the page reloads quietly, without the new-order tint.
      () => onFirstPage.current && void reload.current(true),
    );
  }, [panel, live, t]);

  const columns = useMemo<ColumnDef<OrderSummary, unknown>[]>(
    () => [
      {
        id: 'number',
        header: t('cols.number'),
        meta: { width: 154, skeleton: 80 },
        cell: ({ row: { original: o } }) => (
          <Link href={`/${panel}/orders/${o.id}`} aria-label={t('open', { number: o.number })} className="text-ember">
            <bdi dir="ltr">{o.number}</bdi>
          </Link>
        ),
      },
      { id: 'customer', header: t('cols.customer'), meta: { width: 200, skeleton: 110 }, cell: ({ row }) => row.original.customer.name ?? '—' },
      ...(panel === 'admin'
        ? [{ id: 'vendor', header: t('cols.vendor'), meta: { width: 190, skeleton: 100 }, cell: ({ row }) => nameOf(row.original.vendor.name, locale) } as ColumnDef<OrderSummary, unknown>]
        : []),
      { id: 'status', header: t('cols.status'), meta: { width: 130, skeleton: 80 }, cell: ({ row }) => <Badge type={BADGE[row.original.status]}>{t(`statuses.${row.original.status}`)}</Badge> },
      { id: 'payment', header: t('cols.payment'), meta: { width: 130, skeleton: 80 }, cell: ({ row }) => t(`methods.${row.original.paymentMethod}`) },
      { id: 'amount', header: t('cols.amount'), meta: { width: 130, skeleton: 80 }, cell: ({ row }) => sar(row.original.totalHalalas, locale) },
      { id: 'date', header: t('cols.date'), meta: { width: 150, skeleton: 100 }, cell: ({ row }) => dateOf(row.original.fulfilmentDate, locale) },
    ],
    [t, locale, panel],
  );

  const vendorName = vendors.find((v) => v.id === vendorId);
  const applied = [
    ...(status ? [{ key: 'status', label: t('chip.status', { value: t(`statuses.${status}`) }), onRemove: () => setStatus('') }] : []),
    ...(vendorId ? [{ key: 'vendor', label: t('chip.vendor', { value: vendorName ? nameOf(vendorName.name, locale) : '' }), onRemove: () => setVendorId('') }] : []),
    ...(method ? [{ key: 'method', label: t('chip.method', { value: t(`methods.${method}`) }), onRemove: () => setMethod('') }] : []),
    ...(date ? [{ key: 'date', label: t('chip.date', { value: dateOf(date, locale) }), onRemove: () => setDate('') }] : []),
  ];
  const filtered = applied.length > 0 || q !== '';
  const clear = () => {
    setSearch('');
    setStatus('');
    setMethod('');
    setVendorId('');
    setDate('');
  };
  const empty = data !== 'loading' && typeof data === 'object' && data.rows.length === 0 && cursors.length === 1 && !data.next;

  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={
          // shortcut: no orders export in the API, API gap: shown disabled (#88).
          <Button variant="secondary" disabled>{t('export')}</Button>
        }
      />
      <p aria-live="polite" className="sr-only">{announce}</p>
      {data === 'loading' && !filtered ? (
        // 135:48111: the panel loading body, before the first answer.
        <PanelLoading />
      ) : data === 'denied' ? (
        <StateCard kind="denied" title={ts('denied.title')} body={ts('denied.body')} action={<BackButton label={ts('denied.action')} panel={panel} />} />
      ) : data === 'soon' ? (
        <StateCard kind="soon" title={ts('soon.title')} body={ts('soon.body')} />
      ) : data === 'error' ? (
        <StateCard kind="error" title={ts('error.title')} body={ts('error.body')} action={<Button onClick={() => void load()}>{ts('error.action')}</Button>} />
      ) : empty && !filtered ? (
        <StateCard kind="orders" title={t('empty.noneTitle')} body={t('empty.noneBody')} />
      ) : (
        <>
          <FiltersBar search={search} onSearch={setSearch} searchLabel={t('search')} clearLabel={t('clear')} applied={applied}>
            <Select aria-label={t('status')} value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} className="flex-1">
              <option value="">{t('status')}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </Select>
            {panel === 'admin' && (
              <Select aria-label={t('vendor')} value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="flex-1">
                <option value="">{t('vendor')}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{nameOf(v.name, locale)}</option>
                ))}
              </Select>
            )}
            <Select aria-label={t('method')} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | '')} className="min-w-[170px] flex-1">
              <option value="">{t('method')}</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>{t(`methods.${m}`)}</option>
              ))}
            </Select>
            {/*
              135:47501: «calendar-blank» at the start, then «التاريخ» (or the date). The native picker opens from anywhere
              on the field: its own glyph is stretched over the field and made invisible.
            */}
            <span className="relative flex shrink-0">
              <input
                type="date"
                aria-label={t('date')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`peer relative h-11 w-[160px] rounded-sm border bg-paper pe-s12 ps-[38px] text-body-m outline-none focus:border-2 focus:border-ember [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${date ? 'border-ink-2 text-ink' : 'border-line text-transparent focus:text-ink'}`}
              />
              <CalendarBlank size={18} aria-hidden className="pointer-events-none absolute start-s12 top-1/2 -translate-y-1/2 text-ink-2" />
              {!date && <span aria-hidden className="pointer-events-none absolute start-[38px] top-1/2 -translate-y-1/2 text-body-m text-ink-2 peer-focus:hidden">{t('date')}</span>}
            </span>
          </FiltersBar>
          {empty ? (
            // 135:48353 under the filters, so a search that finds nothing keeps its field and chips.
            <StateCard kind="orders" title={t('empty.title')} body={t('empty.body')} action={<Button variant="secondary" onClick={clear}>{t('empty.action')}</Button>} />
          ) : (
            <DataTable
              inset
              label={t('title')}
              columns={columns}
              data={typeof data === 'object' ? data.rows : []}
              status={data === 'loading' ? 'loading' : 'ready'}
              loadingRows={7}
              hasPrev={cursors.length > 1}
              hasNext={typeof data === 'object' && !!data.next}
              onPrev={() => setCursors(cursors.slice(0, -1))}
              onNext={() => typeof data === 'object' && data.next && setCursors([...cursors, data.next])}
              rowClassName={(o) => (fresh.has(o.id) ? 'row-new' : undefined)}
            />
          )}
        </>
      )}
    </>
  );
}
