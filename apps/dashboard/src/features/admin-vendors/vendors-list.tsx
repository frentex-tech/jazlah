'use client';

import { CalendarBlank, DotsThree } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge, type BadgeType } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import { Tabs } from '@/components/ui/tabs';
import { Link } from '@/i18n/navigation';
import { dayOf } from '@/lib/date';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { TABS, percentOf, type Application, type Page, type Tab, type Vendor } from './types';

// shortcut: a fixed list of the main cities, API gap (no cities endpoint); the API filters vendors by exact city (#46).
const CITIES = [
  ['الرياض', 'Riyadh'], ['جدة', 'Jeddah'], ['مكة المكرمة', 'Makkah'], ['المدينة المنورة', 'Madinah'], ['الدمام', 'Dammam'],
  ['الخبر', 'Khobar'], ['الأحساء', 'Al-Ahsa'], ['بريدة', 'Buraydah'], ['أبها', 'Abha'], ['تبوك', 'Tabuk'], ['حائل', 'Hail'], ['جازان', 'Jazan'],
] as const;
/** A city as stored (Arabic), in the page's language when it is one of the list. */
const cityName = (v: string, locale: string) => CITIES.find(([ar]) => ar === v)?.[locale === 'en' ? 1 : 0] ?? v;
const DEFAULT_TAB: Tab = 'active'; // as in 131:16744
type Row = { id: string; name: string; logoUrl: string | null; city: string | null; badge: BadgeType; status: string; date: string; commission: number | null };

/**
 * VND-DSH-2: the admin stores list (131:16744 and its states). The «pending» tab lists vendor applications waiting for
 * review (GET /v1/admin/vendor-applications?status=pending); «active» and «suspended» list vendors (GET /v1/admin/vendors).
 */
export function VendorsList() {
  const t = useTranslations('vendors');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  // The cursor of each page seen, for these filters; other filters start again from the first page.
  const [paging, setPaging] = useState<{ key: string; cursors: (string | undefined)[] }>({ key: '', cursors: [undefined] });
  const [data, setData] = useState<{ rows: Row[]; next: string | null } | 'loading' | 'error' | 'denied'>('loading');

  // The API wants 2 to 100 characters: shorter searches list everything; typing settles for 300 ms first.
  useEffect(() => {
    // Arabic digits typed in a CR number search as Latin ones, as the API stores them.
    const v = search.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    const id = setTimeout(() => setQ(v.length >= 2 ? v.slice(0, 100) : ''), 300);
    return () => clearTimeout(id);
  }, [search]);
  const key = `${tab}|${q}|${city}`;
  const cursors = paging.key === key ? paging.cursors : [undefined];
  const setCursors = (next: (string | undefined)[]) => setPaging({ key, cursors: next });
  const cursor = cursors[cursors.length - 1];
  const load = useCallback(async () => {
    setData('loading');
    const query = new URLSearchParams({ ...(q && { q }), ...(cursor && { cursor }) });
    try {
      if (tab === 'pending') {
        query.set('status', 'pending');
        const p = await panelFetch<Page<Application>>('admin', `/api/admin/vendor-applications?${query}`);
        // shortcut: the city filter on applications is applied to the loaded page only, API gap (no city filter there) (#46).
        const items = city ? p.items.filter((a) => a.city === city) : p.items;
        setData({ rows: items.map((a) => applicationRow(a, locale)), next: p.nextCursor });
      } else {
        query.set('status', tab);
        if (city) query.set('city', city);
        const p = await panelFetch<Page<Vendor>>('admin', `/api/admin/vendors?${query}`);
        setData({ rows: p.items.map((v) => vendorRow(v, locale)), next: p.nextCursor });
      }
    } catch (e) {
      setData(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, [tab, q, city, cursor, locale]);
  useEffect(() => void load(), [load]);

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: 'store',
        header: t('cols.store'),
        meta: { width: 300, skeleton: 70 },
        cell: ({ row: { original: r } }) => (
          <Link href={`/admin/vendors/${r.id}`} className="flex items-center gap-s12 text-label-m text-ink">
            {r.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
              <img src={r.logoUrl} alt="" className="size-11 rounded-pill object-cover" />
            ) : (
              <span aria-hidden className="flex size-11 items-center justify-center rounded-pill bg-brand text-[20px] text-gold-light">{monogram(r.name)}</span>
            )}
            {r.name}
          </Link>
        ),
      },
      { id: 'city', header: t('cols.city'), meta: { width: 130, skeleton: 70 }, cell: ({ row }) => (row.original.city ? cityName(row.original.city, locale) : t('unknown')) },
      {
        id: 'status',
        header: t('cols.status'),
        meta: { width: 150, skeleton: 110 },
        cell: ({ row }) => <Badge type={row.original.badge}>{t(`badges.${row.original.status}`)}</Badge>,
      },
      { id: 'date', header: t('cols.applied'), meta: { width: 150, skeleton: 120 }, cell: ({ row }) => row.original.date },
      // shortcut: no product count on the vendor answer, API gap: shown as a dash (#46).
      { id: 'products', header: t('cols.products'), meta: { width: 90, skeleton: 60 }, cell: () => t('unknown') },
      {
        id: 'commission',
        header: t('cols.commission'),
        meta: { width: 90, skeleton: 60 },
        cell: ({ row }) => (row.original.commission === null ? t('noCommission') : `${percentOf(row.original.commission)}%`),
      },
    ],
    [t, locale],
  );

  const applied = [
    ...(tab !== DEFAULT_TAB ? [{ key: 'status', label: t('chip.status', { value: t(`tabs.${tab}`) }), onRemove: () => setTab(DEFAULT_TAB) }] : []),
    ...(city ? [{ key: 'city', label: t('chip.city', { value: cityName(city, locale) }), onRemove: () => setCity('') }] : []),
  ];
  const filtered = applied.length > 0 || q !== '';
  const clear = () => {
    setSearch('');
    setTab(DEFAULT_TAB);
    setCity('');
  };
  const card = 'h-[360px]';

  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={
          <>
            {/* shortcut: no vendor invitation or export in the API, API gap: shown disabled (#46). */}
            <Button disabled>{t('invite')}</Button>
            <Button variant="secondary" disabled>{t('export')}</Button>
          </>
        }
      />
      <FiltersBar search={search} onSearch={setSearch} searchLabel={t('search')} clearLabel={t('clear')} applied={data === 'denied' ? [] : applied}>
        {/* shortcut: no category or date filter in the API, API gap: shown disabled (#46). */}
        <Select aria-label={t('category')} value="" disabled className="flex-1">
          <option value="">{t('category')}</option>
        </Select>
        <Select aria-label={t('city')} value={city} onChange={(e) => setCity(e.target.value)} className="flex-1">
          <option value="">{t('city')}</option>
          {CITIES.map(([ar, en]) => (
            <option key={ar} value={ar}>{locale === 'en' ? en : ar}</option>
          ))}
        </Select>
        {/* The status filter and the tabs are one choice; the default tab reads as no filter. */}
        <Select aria-label={t('status')} value={tab === DEFAULT_TAB ? '' : tab} onChange={(e) => setTab((e.target.value || DEFAULT_TAB) as Tab)} className="flex-1">
          <option value="">{t('status')}</option>
          {TABS.filter((k) => k !== DEFAULT_TAB).map((k) => (
            <option key={k} value={k}>{t(`tabs.${k}`)}</option>
          ))}
        </Select>
        <span aria-disabled className="flex h-11 w-[160px] shrink-0 items-center justify-between gap-s8 rounded-sm border border-line bg-paper px-s12 text-body-m text-muted-soft">
          {t('appliedOn')}
          <CalendarBlank size={18} aria-hidden />
        </span>
      </FiltersBar>

      {data === 'denied' ? (
        <StateCard
          kind="denied"
          className={card}
          title={t('denied.title')}
          body={t('denied.body')}
          action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>}
        />
      ) : (
        <>
          <Tabs tabs={TABS.map((k) => ({ key: k, label: t(`tabs.${k}`) }))} value={tab} onChange={setTab} label={t('tabsLabel')} controls="vendors-table" idPrefix="vendors-tab" />
          <div id="vendors-table" role="tabpanel" aria-labelledby={`vendors-tab-${tab}`}>
            {data === 'error' ? (
              <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
            ) : data !== 'loading' && data.rows.length === 0 && cursors.length === 1 && !data.next ? (
              <StateCard
                kind="search"
                className={card}
                title={t(filtered ? 'empty.title' : 'empty.noneTitle')}
                body={t(filtered ? 'empty.body' : 'empty.noneBody')}
                action={filtered && <Button variant="secondary" onClick={clear}>{t('empty.action')}</Button>}
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
                rowActions={(r) => (
                  <Link href={`/admin/vendors/${r.id}`} aria-label={t('open', { name: r.name })} className="flex text-ink-2">
                    <DotsThree size={22} aria-hidden />
                  </Link>
                )}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

/** The store monogram of the frames: the first letter of the last word, without «ال» (مجازر الفلاح → ف). */
export const monogram = (name: string) => (name.trim().split(/\s+/).pop() ?? '').replace(/^ال(?=..)/, '').charAt(0).toUpperCase();

const nameOf = (n: { ar: string; en: string }, locale: string) => (locale === 'en' ? n.en : n.ar);
const applicationRow = (a: Application, locale: string): Row => ({
  id: a.id, name: nameOf(a.name, locale), logoUrl: null, city: a.city, badge: a.status === 'pending' ? 'info' : a.status === 'approved' ? 'success' : 'danger',
  status: a.status, date: dayOf(a.createdAt, locale), commission: null,
});
// A vendor's date is its approval (createdAt): the vendor answer has no application date.
const vendorRow = (v: Vendor, locale: string): Row => ({
  id: v.id, name: nameOf(v.name, locale), logoUrl: v.logoUrl, city: v.city, badge: v.status === 'active' ? 'success' : 'neutral',
  status: v.status, date: dayOf(v.createdAt, locale), commission: v.commissionBasisPoints,
});
