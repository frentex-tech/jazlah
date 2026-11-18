'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Badge, type BadgeType } from '@/components/ui/badge';
import { DataTable, RowActionsTrigger, type TableStatus } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Select } from '@/components/ui/select';
import { DEMO_STATUSES, type DemoOrder, type DemoStatus } from './mock-orders';

const badgeType: Record<DemoStatus, BadgeType> = { preparing: 'warning', delivered: 'success', review: 'info', cancelled: 'danger', new: 'neutral' };
const PAGE_SIZE = 5;

export function OrdersTable() {
  const t = useTranslations('demo');
  const tt = useTranslations();
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [result, setResult] = useState<{ items: DemoOrder[]; total: number }>({ items: [], total: 0 });
  const [state, setState] = useState<TableStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    if (sorting[0]) params.set('sort', `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}`);
    if (new URLSearchParams(window.location.search).get('fail')) params.set('fail', '1');
    setState('loading');
    fetch(`/api/mock/orders?${params}`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        setResult(await r.json());
        setState('ready');
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setState('error');
      });
    return () => ctrl.abort();
  }, [page, status, q, sorting, attempt]);

  const columns = useMemo<ColumnDef<DemoOrder, unknown>[]>(
    () => [
      { id: 'number', accessorKey: 'number', header: t('orderNo'), meta: { width: 130 }, enableSorting: false, cell: (c) => <span className="text-ember">#{c.row.original.number}</span> },
      { id: 'customer', accessorKey: 'customer', header: t('customer'), meta: { width: 260 }, enableSorting: false },
      { id: 'store', accessorKey: 'store', header: t('store'), meta: { width: 210 }, enableSorting: false },
      { id: 'status', accessorKey: 'status', header: t('status'), meta: { width: 150 }, enableSorting: false, cell: (c) => <Badge type={badgeType[c.row.original.status]}>{t(`statuses.${c.row.original.status}`)}</Badge> },
      { id: 'amountHalalas', accessorKey: 'amountHalalas', header: t('amount'), meta: { width: 120, skeleton: 80 }, cell: (c) => `${format.number(c.row.original.amountHalalas / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2, numberingSystem: 'latn' })} ${tt('demo.currency')}` },
      { id: 'date', accessorKey: 'date', header: t('date'), meta: { width: 150 }, cell: (c) => format.dateTime(new Date(c.row.original.date), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh', numberingSystem: 'latn' }) },
    ],
    [t, tt, format],
  );

  return (
    <>
      <FiltersBar
        search={q}
        onSearch={(v) => { setQ(v); setPage(1); }}
        searchLabel={tt('table.filter')}
        clearLabel={tt('table.clearAll')}
        applied={status ? [{ key: 'status', label: `${t('status')}: ${t(`statuses.${status as DemoStatus}`)}`, onRemove: () => setStatus('') }] : []}
      >
        <Select value={status} aria-label={t('status')} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">{t('statusAll')}</option>
          {DEMO_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`statuses.${s}`)}</option>
          ))}
        </Select>
      </FiltersBar>
      <DataTable
        columns={columns}
        data={result.items}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        status={state}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1); }}
        onRetry={() => setAttempt((a) => a + 1)}
        rowActions={() => <RowActionsTrigger aria-label={tt('table.actions')} />}
      />
    </>
  );
}
