'use client';

import { DotsThree } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge, type BadgeType } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import { Link } from '@/i18n/navigation';
import { dayOf } from '@/lib/date';
import { sar } from '@/lib/money';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { COUPON_STATUSES, type Coupon, type CouponStatus, type Page } from './types';

export const STATUS_BADGE: Record<CouponStatus, BadgeType> = { active: 'success', scheduled: 'info', expired: 'warning', inactive: 'neutral' };
/** «25%» or «50.00 ر.س». */
export const discountOf = (c: Pick<Coupon, 'type' | 'value'>, locale: string) => (c.type === 'percent' ? `${c.value}%` : sar(c.value, locale));

/**
 * CRT-DSH-1: the admin coupons list (no Figma frame; the admin list pattern of the stores and products lists).
 * GET /v1/admin/coupons with `status` and `q` (code), cursor paging.
 */
export function CouponsList() {
  const t = useTranslations('coupons');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<CouponStatus | ''>('');
  const [paging, setPaging] = useState<{ key: string; cursors: (string | undefined)[] }>({ key: '', cursors: [undefined] });
  const [data, setData] = useState<{ rows: Coupon[]; next: string | null } | 'loading' | 'error' | 'denied'>('loading');

  useEffect(() => {
    const id = setTimeout(() => setQ(search.trim().slice(0, 32)), 300);
    return () => clearTimeout(id);
  }, [search]);
  const key = `${status}|${q}`;
  const cursors = paging.key === key ? paging.cursors : [undefined];
  const setCursors = (next: (string | undefined)[]) => setPaging({ key, cursors: next });
  const cursor = cursors[cursors.length - 1];
  // Only the latest request may set the list: a slow answer under old filters must not overwrite newer results.
  const latest = useRef(0);
  const load = useCallback(async () => {
    const req = ++latest.current;
    setData('loading');
    const query = new URLSearchParams({ ...(status && { status }), ...(q && { q }), ...(cursor && { cursor }) });
    try {
      const p = await panelFetch<Page<Coupon>>('admin', `/api/admin/coupons?${query}`);
      if (req === latest.current) setData({ rows: p.items, next: p.nextCursor });
    } catch (e) {
      if (req === latest.current) setData(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, [status, q, cursor]);
  useEffect(() => void load(), [load]);

  const columns = useMemo<ColumnDef<Coupon, unknown>[]>(
    () => [
      {
        id: 'code',
        header: t('cols.code'),
        meta: { width: 200, skeleton: 90 },
        cell: ({ row: { original: c } }) => (
          <Link href={`/admin/marketing/coupons/${c.id}`} dir="ltr" className="text-label-m text-ink">
            {c.code}
          </Link>
        ),
      },
      {
        id: 'discount',
        header: t('cols.discount'),
        meta: { width: 200, skeleton: 110 },
        cell: ({ row: { original: c } }) => (
          <div className="flex flex-col gap-[2px]">
            <span className="text-body-m text-ink">{t(`types.${c.type}`)} · <bdi dir={c.type === 'percent' ? 'ltr' : undefined}>{discountOf(c, locale)}</bdi></span>
            {c.minOrderHalalas !== null && <span className="text-caption text-ink-2">{t('minOrder', { amount: sar(c.minOrderHalalas, locale) })}</span>}
          </div>
        ),
      },
      { id: 'status', header: t('cols.status'), meta: { width: 130, skeleton: 90 }, cell: ({ row }) => <Badge type={STATUS_BADGE[row.original.status]}>{t(`statuses.${row.original.status}`)}</Badge> },
      {
        id: 'usage',
        header: t('cols.usage'),
        meta: { width: 130, skeleton: 70 },
        cell: ({ row: { original: c } }) => (c.usageLimit === null ? t('usageNoLimit', { used: c.usageCount }) : t('usageOf', { used: c.usageCount, limit: c.usageLimit })),
      },
      {
        id: 'dates',
        header: t('cols.dates'),
        meta: { width: 360, skeleton: 160 },
        cell: ({ row: { original: c } }) => t('dateRange', { from: dayOf(c.startsAt, locale), to: dayOf(c.endsAt, locale) }),
      },
    ],
    [t, locale],
  );

  const applied = status ? [{ key: 'status', label: t('chip.status', { value: t(`statuses.${status}`) }), onRemove: () => setStatus('') }] : [];
  const filtered = applied.length > 0 || q !== '';
  const clear = () => {
    setSearch('');
    setStatus('');
  };
  const card = 'h-[360px]';

  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={data !== 'denied' && <Link href="/admin/marketing/coupons/new" className={buttonVariants()}>{t('new')}</Link>}
      />
      <FiltersBar search={search} onSearch={setSearch} searchLabel={t('search')} clearLabel={t('clear')} applied={data === 'denied' ? [] : applied}>
        <Select aria-label={t('status')} value={status} onChange={(e) => setStatus(e.target.value as CouponStatus | '')} className="w-[220px]">
          <option value="">{t('status')}</option>
          {COUPON_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`statuses.${s}`)}</option>
          ))}
        </Select>
      </FiltersBar>

      {data === 'denied' ? (
        <StateCard
          kind="denied"
          className={card}
          title={t('denied.title')}
          body={t('denied.body')}
          action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>}
        />
      ) : data === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : data !== 'loading' && data.rows.length === 0 && cursors.length === 1 && !data.next ? (
        <StateCard
          kind="search"
          className={card}
          title={t(filtered ? 'empty.title' : 'empty.noneTitle')}
          body={t(filtered ? 'empty.body' : 'empty.noneBody')}
          action={
            filtered ? (
              <Button variant="secondary" onClick={clear}>{t('empty.action')}</Button>
            ) : (
              <Link href="/admin/marketing/coupons/new" className={buttonVariants()}>{t('new')}</Link>
            )
          }
        />
      ) : (
        <DataTable
          tall
          label={t('title')}
          columns={columns}
          data={data === 'loading' ? [] : data.rows}
          status={data === 'loading' ? 'loading' : 'ready'}
          loadingRows={6}
          hasPrev={cursors.length > 1}
          hasNext={data !== 'loading' && !!data.next}
          onPrev={() => setCursors(cursors.slice(0, -1))}
          onNext={() => data !== 'loading' && data.next && setCursors([...cursors, data.next])}
          rowActions={(c) => (
            <Link href={`/admin/marketing/coupons/${c.id}`} aria-label={t('open', { code: c.code })} className="flex text-ink-2">
              <DotsThree size={22} aria-hidden />
            </Link>
          )}
        />
      )}
    </>
  );
}
