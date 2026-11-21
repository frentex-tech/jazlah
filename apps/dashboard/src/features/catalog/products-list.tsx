'use client';

import { CalendarBlank, DotsThree } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { dayOf } from '@/lib/date';
import type { Vendor } from '@/features/admin-vendors/types';
import { Badge, type BadgeType } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { sar } from '@/lib/money';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { loadAll } from './client';
import { PRODUCT_STATUSES, bySortOrder, type Page, type ProductCard, type ProductStatus, type RefItem } from './types';

/** The badge of a product: its status, or «غير متاح» for a published product switched off (131:21286). */
export function productBadge(p: Pick<ProductCard, 'status' | 'isAvailable'>): { key: string; type: BadgeType } {
  if (p.status === 'published' && !p.isAvailable) return { key: 'unavailable', type: 'warning' };
  return { key: p.status, type: ({ published: 'success', pending_review: 'info', rejected: 'danger', draft: 'neutral' } as const)[p.status] };
}

/**
 * CAT-DSH-1: «المنتجات» (131:21286 and its states, 131:22654 filtered). GET /v1/admin/products with `status` and
 * `vendorId`; the availability switch is PATCH …/{id}/availability, on JAZLA's own products only (the API refuses others).
 */
export function ProductsList() {
  const t = useTranslations('catalog.products');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [vendorId, setVendorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vendors, setVendors] = useState<Vendor[] | 'failed'>([]);
  const [categories, setCategories] = useState<RefItem[]>([]);
  const [paging, setPaging] = useState<{ key: string; cursors: (string | undefined)[] }>({ key: '', cursors: [undefined] });
  const [data, setData] = useState<{ items: ProductCard[]; next: string | null } | 'loading' | 'error' | 'denied'>('loading');
  const [switching, setSwitching] = useState<string | null>(null);

  // The filters' options: vendors (active ones, JAZLA included) and categories; a failure leaves a filter empty.
  useEffect(() => {
    loadAll<Vendor>('admin', '/api/admin/vendors?status=active').then(setVendors, () => setVendors('failed'));
    loadAll<RefItem>('admin', '/api/admin/catalog/lists/categories').then((c) => setCategories(c.sort(bySortOrder)), () => {});
  }, []);
  const vendorList = vendors === 'failed' ? [] : vendors;
  const platformId = vendorList.find((v) => v.isPlatform)?.id;
  // The card does not say which vendor is JAZLA's: without the vendors list, every row offers the form and the
  // switch, and the API refuses another store's product (NOT_FOUND, shown as a toast).
  const ownProduct = useCallback((p: ProductCard) => (vendors === 'failed' ? true : p.vendor.id === platformId), [vendors, platformId]);

  const key = `${status}|${vendorId}`;
  const cursors = paging.key === key ? paging.cursors : [undefined];
  const setCursors = (next: (string | undefined)[]) => setPaging({ key, cursors: next });
  const cursor = cursors[cursors.length - 1];
  const load = useCallback(async () => {
    setData('loading');
    const query = new URLSearchParams({ ...(status && { status }), ...(vendorId && { vendorId }), ...(cursor && { cursor }) });
    try {
      const p = await panelFetch<Page<ProductCard>>('admin', `/api/admin/catalog/products?${query}`);
      setData({ items: p.items, next: p.nextCursor });
    } catch (e) {
      setData(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, [status, vendorId, cursor]);
  useEffect(() => void load(), [load]);

  const nameOf = useCallback((n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '—'), [locale]);
  const categoryName = useCallback((id: string) => nameOf(categories.find((c) => c.id === id)?.name), [categories, nameOf]);

  const toggle = useCallback(
    async (p: ProductCard, isAvailable: boolean) => {
      setSwitching(p.id);
      try {
        await panelFetch('admin', `/api/admin/catalog/products/${p.id}/availability`, { method: 'PATCH', body: JSON.stringify({ isAvailable }) });
        setData((d) => (typeof d === 'object' ? { ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, isAvailable } : x)) } : d));
        toast('success', t(isAvailable ? 'availableOn' : 'availableOff', { name: nameOf(p.name) }));
      } catch (e) {
        toast('error', t(e instanceof ApiError && e.code === 'PRODUCT_NOT_EDITABLE' ? 'notEditable' : e instanceof ApiError && e.code === 'NOT_FOUND' ? 'notJazla' : 'availabilityFailed'));
      } finally {
        setSwitching(null);
      }
    },
    [t, nameOf],
  );

  const columns = useMemo<ColumnDef<ProductCard, unknown>[]>(
    () => [
      {
        id: 'product',
        header: t('cols.product'),
        meta: { width: 250, skeleton: 150 },
        cell: ({ row: { original: p } }) => {
          const inner = (
            <>
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
                <img src={p.coverUrl} alt="" className="size-11 shrink-0 rounded-sm object-cover" />
              ) : (
                <span aria-hidden className="size-11 shrink-0 rounded-sm bg-sand" />
              )}
              <span className="truncate">{nameOf(p.name)}</span>
            </>
          );
          // JAZLA's own products open in the form; other vendors' are reviewed (CAT-DSH-2).
          return ownProduct(p) ? (
            <Link href={`/admin/catalog/products/${p.id}`} className="flex min-w-0 items-center gap-s12 text-label-m text-ink">{inner}</Link>
          ) : (
            <span className="flex min-w-0 items-center gap-s12 text-label-m text-ink">{inner}</span>
          );
        },
      },
      { id: 'vendor', header: t('cols.vendor'), meta: { width: 160, skeleton: 90 }, cell: ({ row }) => nameOf(row.original.vendor.name) },
      { id: 'category', header: t('cols.category'), meta: { width: 110, skeleton: 60 }, cell: ({ row }) => categoryName(row.original.categoryId) },
      {
        id: 'price',
        header: t('cols.price'),
        meta: { width: 110, skeleton: 70 },
        cell: ({ row }) => (row.original.minPriceHalalas === null ? '—' : sar(row.original.minPriceHalalas, locale)),
      },
      {
        id: 'status',
        header: t('cols.status'),
        meta: { width: 140, skeleton: 90 },
        cell: ({ row }) => {
          const b = productBadge(row.original);
          return <Badge type={b.type}>{t(`status.${b.key}`)}</Badge>;
        },
      },
      // The card has no updatedAt: the date is when the product was created.
      { id: 'date', header: t('cols.date'), meta: { width: 130, skeleton: 90 }, cell: ({ row }) => dayOf(row.original.createdAt, locale) },
      {
        id: 'available',
        header: t('cols.available'),
        meta: { width: 80, skeleton: 40 },
        cell: ({ row: { original: p } }) =>
          ownProduct(p) && p.status !== 'pending_review' ? (
            <Switch hideLabel label={t('availableLabel', { name: nameOf(p.name) })} checked={p.isAvailable} disabled={switching === p.id} onChange={(v) => void toggle(p, v)} />
          ) : null,
      },
    ],
    [t, locale, nameOf, categoryName, ownProduct, switching, toggle],
  );

  // shortcut: no search or category filter on GET /v1/admin/products, API gap: both apply to the loaded page only (#49).
  const q = search.trim().toLowerCase();
  const rows =
    typeof data === 'object'
      ? data.items.filter(
          (p) =>
            (!categoryId || p.categoryId === categoryId) &&
            (q.length < 2 || [p.name.ar, p.name.en, p.vendor.name?.ar ?? '', p.vendor.name?.en ?? ''].some((v) => v.toLowerCase().includes(q))),
        )
      : [];
  const vendorName = nameOf(vendorList.find((v) => v.id === vendorId)?.name);
  const applied = [
    ...(status ? [{ key: 'status', label: t('chip.status', { value: t(`status.${status}`) }), onRemove: () => setStatus('') }] : []),
    ...(vendorId ? [{ key: 'vendor', label: t('chip.vendor', { value: vendorName }), onRemove: () => setVendorId('') }] : []),
    ...(categoryId ? [{ key: 'category', label: t('chip.category', { value: categoryName(categoryId) }), onRemove: () => setCategoryId('') }] : []),
  ];
  const filtered = applied.length > 0 || q.length >= 2;
  const clear = () => {
    setSearch('');
    setStatus('');
    setVendorId('');
    setCategoryId('');
  };
  const card = 'h-[360px]';

  return (
    <>
      <PageHeader
        breadcrumb={t('breadcrumb')}
        title={t('title')}
        actions={
          <>
            <Link href="/admin/catalog/products/new" className={buttonVariants()}>{t('add')}</Link>
            <Link href="/admin/catalog/categories" className={buttonVariants({ variant: 'secondary' })}>{t('categories')}</Link>
            <Link href="/admin/catalog/review" className={buttonVariants({ variant: 'secondary' })}>{t('review')}</Link>
          </>
        }
      />
      <FiltersBar search={search} onSearch={setSearch} searchLabel={t('search')} clearLabel={t('clear')} applied={data === 'denied' ? [] : applied}>
        <Select aria-label={t('category')} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex-1">
          <option value="">{t('category')}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{nameOf(c.name)}</option>)}
        </Select>
        <Select aria-label={t('vendor')} value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="flex-1">
          <option value="">{t('vendor')}</option>
          {vendorList.map((v) => <option key={v.id} value={v.id}>{nameOf(v.name)}</option>)}
        </Select>
        <Select aria-label={t('statusFilter')} value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} className="flex-1">
          <option value="">{t('statusFilter')}</option>
          {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </Select>
        {/* shortcut: no date filter on GET /v1/admin/products, API gap: shown disabled (#49). */}
        <span aria-disabled className="flex h-11 w-[160px] shrink-0 items-center justify-between gap-s8 rounded-sm border border-line bg-paper px-s12 text-body-m text-muted-soft">
          {t('cols.date')}
          <CalendarBlank size={18} aria-hidden />
        </span>
      </FiltersBar>

      {data === 'denied' ? (
        <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>} />
      ) : data === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : data !== 'loading' && rows.length === 0 && cursors.length === 1 && !data.next ? (
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
          data={rows}
          status={data === 'loading' ? 'loading' : 'ready'}
          loadingRows={6}
          hasPrev={cursors.length > 1}
          hasNext={data !== 'loading' && !!data.next}
          onPrev={() => setCursors(cursors.slice(0, -1))}
          onNext={() => data !== 'loading' && data.next && setCursors([...cursors, data.next])}
          rowActions={(p) =>
            ownProduct(p) ? (
              <Link href={`/admin/catalog/products/${p.id}`} aria-label={t('open', { name: nameOf(p.name) })} className="flex text-ink-2">
                <DotsThree size={22} aria-hidden />
              </Link>
            ) : null
          }
        />
      )}
    </>
  );
}
