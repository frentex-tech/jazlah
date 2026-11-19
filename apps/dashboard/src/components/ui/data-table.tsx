'use client';

import { CaretLeft, CaretRight, CaretUpDown, DotsThree } from '@phosphor-icons/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Skeleton } from './skeleton';
import { StatePanel } from './state-panel';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Fixed column width in px, as in the Figma table. */
    width?: number;
    /** Skeleton bar width in px for the loading state. */
    skeleton?: number;
  }
}

export type TableStatus = 'ready' | 'loading' | 'error';

type Props<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  status: TableStatus;
  /** Keyset paging (docs/frontend/conventions.md): the caller keeps the cursors; no page numbers, no total. */
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Accessible name of the table, e.g. the page title. */
  label: string;
  /** Skeleton rows while loading (the page size). */
  loadingRows?: number;
  sorting?: SortingState;
  onSortingChange?: (s: SortingState) => void;
  columnVisibility?: VisibilityState;
  onRetry?: () => void;
  /** Shown when there are no rows. Defaults to the «orders» empty panel. */
  empty?: React.ReactNode;
  /** Row actions menu trigger (the ⋯ cell). Omit to hide the column. */
  rowActions?: (row: T) => React.ReactNode;
};

// Figma DS «Data table» (16:1564): states default, loading, empty, error. Paging, sorting and filters are the caller's.
export function DataTable<T>({
  columns, data, status, label, hasPrev, hasNext, onPrev, onNext, loadingRows = 10, sorting = [], onSortingChange, columnVisibility, onRetry, empty, rowActions,
}: Props<T>) {
  const t = useTranslations();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting, columnVisibility },
    onSortingChange: (updater) => onSortingChange?.(typeof updater === 'function' ? updater(sorting) : updater),
  });

  const leafColumns = table.getVisibleLeafColumns();
  const cell = 'flex shrink-0 items-center px-s8';
  const row = 'flex items-center px-s32';

  return (
    <div className="w-full overflow-hidden rounded-md border border-line bg-paper" aria-busy={status === 'loading'}>
      <div role="table" aria-label={label}>
        <div role="row" className={cn(row, 'h-12 bg-sand')}>
          {table.getHeaderGroups()[0]!.headers.map((h) => {
            const sortable = h.column.getCanSort() && !!onSortingChange;
            const dir = h.column.getIsSorted();
            return (
              <div
                key={h.id}
                role="columnheader"
                aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
                className={cn(cell, 'h-12 text-label-m text-ink')}
                style={{ width: h.column.columnDef.meta?.width }}
              >
                {sortable ? (
                  <button type="button" onClick={h.column.getToggleSortingHandler()} className="flex items-center">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <CaretUpDown size={14} className="text-ink-2" aria-hidden />
                  </button>
                ) : (
                  flexRender(h.column.columnDef.header, h.getContext())
                )}
              </div>
            );
          })}
          {rowActions && <div role="columnheader" aria-label={t('table.actions')} className={cn(cell, 'w-[52px]')} />}
        </div>

        {status === 'loading' &&
          Array.from({ length: loadingRows }, (_, i) => (
            <div key={i} role="row" className={cn(row, 'h-14 border-b border-line')}>
              {leafColumns.map((c) => (
                <div key={c.id} role="cell" className={cell} style={{ width: c.columnDef.meta?.width }}>
                  <Skeleton style={{ width: c.columnDef.meta?.skeleton ?? 90 }} />
                </div>
              ))}
              {rowActions && <div role="cell" className={cn(cell, 'w-[52px]')} />}
            </div>
          ))}

        {status === 'ready' &&
          table.getRowModel().rows.map((r) => (
            <div key={r.id} role="row" className={cn(row, 'h-14 border-b border-line text-body-m text-ink')}>
              {r.getVisibleCells().map((c) => (
                <div key={c.id} role="cell" className={cn(cell, 'h-14')} style={{ width: c.column.columnDef.meta?.width }}>
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </div>
              ))}
              {rowActions && (
                <div role="cell" className={cn(cell, 'h-14 w-[52px]')}>
                  {rowActions(r.original)}
                </div>
              )}
            </div>
          ))}
      </div>

      {status === 'error' && (
        <div className="flex h-80 items-center justify-center">
          <StatePanel
            kind="error"
            title={t('state.error.title')}
            body={t('state.error.body')}
            action={onRetry && <Button onClick={onRetry}>{t('state.error.action')}</Button>}
          />
        </div>
      )}

      {status === 'ready' && data.length === 0 && (
        <div className="flex h-80 items-center justify-center">
          {empty ?? <StatePanel kind="orders" title={t('state.empty.title')} body={t('state.empty.body')} />}
        </div>
      )}

      {(status === 'loading' || (status === 'ready' && data.length > 0)) && (
        <nav className="flex h-14 items-center justify-between px-s32" aria-label={t('table.paging')}>
          <p className="text-body-m text-ink-2">{status === 'ready' ? t('table.showing', { count: data.length }) : ' '}</p>
          <div className="flex items-center gap-s8">
            <PageButton label={t('table.prev')} disabled={!hasPrev || status !== 'ready'} onClick={onPrev}>
              <CaretLeft size={18} className="rtl:-scale-x-100" aria-hidden />
            </PageButton>
            <PageButton label={t('table.next')} disabled={!hasNext || status !== 'ready'} onClick={onNext}>
              <CaretRight size={18} className="rtl:-scale-x-100" aria-hidden />
            </PageButton>
          </div>
        </nav>
      )}
    </div>
  );
}

/** The ⋯ trigger used in the actions cell. */
export function RowActionsTrigger(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} className="flex items-center text-ink-2">
      <DotsThree size={22} aria-hidden />
    </button>
  );
}

// Disabled like the other DS controls: the line border stays, the icon turns muted-soft (no opacity fade).
function PageButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-sm border border-line text-ink disabled:text-muted-soft"
      {...props}
    >
      {children}
    </button>
  );
}
