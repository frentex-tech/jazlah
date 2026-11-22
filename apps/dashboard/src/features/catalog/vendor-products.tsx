'use client';

import { CalendarBlank, DotsThree } from '@phosphor-icons/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge, type BadgeType } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FiltersBar } from '@/components/ui/filters-bar';
import { Notice } from '@/components/ui/notice';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import { toast } from '@/components/ui/toast';
import { Link, useRouter } from '@/i18n/navigation';
import { dayOf } from '@/lib/date';
import { sar } from '@/lib/money';
import { PRODUCT_NOT_SUBMITTABLE, ApiError } from '@/lib/panel-fetch';
import { productBadge } from './products-list';
import { PRODUCT_STATUSES, type Page, type Product, type ProductCard, type ProductStatus, type RefItem } from './types';
import { StoreBlocked, vendorFetch } from './vendor-product';

const BASE = '/api/vendor/products';
type Availability = 'available' | 'hidden' | 'out';
/** The «التوفر» badge (131:25074): out of stock when switched off, not shown until published, else available. */
const availabilityOf = (p: ProductCard): Availability => (!p.isAvailable ? 'out' : p.status === 'published' ? 'available' : 'hidden');
/** A rejected product opens on its review notes (131:38124), the others in the form. */
const openHref = (p: ProductCard) => (p.status === 'rejected' ? `/vendor/products/${p.id}/review` : `/vendor/products/${p.id}`);
const AVAILABILITY: Record<Availability, BadgeType> = { available: 'success', hidden: 'neutral', out: 'warning' };

/**
 * CAT-DSH-2: «منتجاتي» (131:25074 default, 131:25293 loading, 131:25601 empty, 131:25808 error, 131:26015 store
 * blocked, 131:26222 filtered). GET /v1/vendor/products (status filter); the row menu opens the product or its review
 * notes, submits it for review (POST …/submit) and switches its availability (PATCH …/availability, no review).
 */
export function VendorProducts() {
  const t = useTranslations('vendorProducts');
  const tp = useTranslations('catalog.products');
  const locale = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [availability, setAvailability] = useState<Availability | ''>('');
  const [categories, setCategories] = useState<RefItem[]>([]);
  const [rejected, setRejected] = useState(0);
  const [paging, setPaging] = useState<{ key: string; cursors: (string | undefined)[] }>({ key: '', cursors: [undefined] });
  const [data, setData] = useState<{ items: ProductCard[]; next: string | null } | 'loading' | 'error' | 'blocked'>('loading');
  const [busy, setBusy] = useState<string | null>(null);

  const cursors = paging.key === status ? paging.cursors : [undefined];
  const setCursors = (next: (string | undefined)[]) => setPaging({ key: status, cursors: next });
  const cursor = cursors[cursors.length - 1];
  const load = useCallback(async () => {
    setData('loading');
    const query = new URLSearchParams({ ...(status && { status }), ...(cursor && { cursor }) });
    try {
      const p = await vendorFetch<Page<ProductCard>>(`${BASE}?${query}`);
      setData({ items: p.items, next: p.nextCursor });
    } catch (e) {
      setData(e instanceof ApiError && e.code === 'VENDOR_SUSPENDED' ? 'blocked' : 'error');
    }
  }, [status, cursor]);
  useEffect(() => void load(), [load]);

  // The rejected count of the notice (first 50; shortcut: API gap, no count, #52) and the category names; failures stay quiet.
  const loadRejected = useCallback(() => {
    vendorFetch<Page<ProductCard>>(`${BASE}?status=rejected&limit=50`).then((p) => setRejected(p.items.length), () => {});
  }, []);
  useEffect(() => {
    loadRejected();
    vendorFetch<{ categories: RefItem[] }>('/api/vendor/catalog/options').then((o) => setCategories(o.categories), () => {});
  }, [loadRejected]);

  const nameOf = useCallback((n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '—'), [locale]);
  const categoryName = useCallback((id: string) => nameOf(categories.find((c) => c.id === id)?.name), [categories, nameOf]);

  const act = useCallback(
    async (p: ProductCard, action: 'submit' | 'on' | 'off') => {
      setBusy(p.id);
      try {
        const next = await vendorFetch<Product>(
          `${BASE}/${p.id}/${action === 'submit' ? 'submit' : 'availability'}`,
          action === 'submit' ? { method: 'POST' } : { method: 'PATCH', body: JSON.stringify({ isAvailable: action === 'on' }) },
        );
        setData((d) => (typeof d === 'object' ? { ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, status: next.status, isAvailable: next.isAvailable } : x)) } : d));
        toast('success', t(`done.${action}`, { name: nameOf(p.name) }));
        if (action === 'submit') loadRejected();
      } catch (e) {
        const code = e instanceof ApiError ? e.code : '';
        if (code === 'VENDOR_SUSPENDED') return setData('blocked');
        toast('error', t(code === PRODUCT_NOT_SUBMITTABLE ? 'failed.incomplete' : code === 'PRODUCT_NOT_EDITABLE' ? 'failed.notEditable' : 'failed.other'));
      } finally {
        setBusy(null);
      }
    },
    [t, nameOf, loadRejected],
  );

  const columns = useMemo<ColumnDef<ProductCard, unknown>[]>(
    () => [
      {
        id: 'product',
        header: tp('cols.product'),
        meta: { width: 300, skeleton: 150 },
        cell: ({ row: { original: p } }) => (
          <Link href={openHref(p)} className="flex min-w-0 items-center gap-s12 text-label-m text-ink">
            {p.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
              <img src={p.coverUrl} alt="" className="size-11 shrink-0 rounded-sm object-cover" />
            ) : (
              <span aria-hidden className="size-11 shrink-0 rounded-sm bg-sand" />
            )}
            <span className="truncate">{nameOf(p.name)}</span>
          </Link>
        ),
      },
      { id: 'category', header: tp('cols.category'), meta: { width: 110, skeleton: 60 }, cell: ({ row }) => categoryName(row.original.categoryId) },
      { id: 'price', header: tp('cols.price'), meta: { width: 110, skeleton: 70 }, cell: ({ row }) => (row.original.minPriceHalalas === null ? '—' : sar(row.original.minPriceHalalas, locale)) },
      {
        id: 'availability',
        header: t('cols.availability'),
        meta: { width: 120, skeleton: 70 },
        cell: ({ row }) => {
          const a = availabilityOf(row.original);
          return <Badge type={AVAILABILITY[a]}>{t(`availability.${a}`)}</Badge>;
        },
      },
      {
        id: 'status',
        header: tp('cols.status'),
        meta: { width: 140, skeleton: 90 },
        cell: ({ row }) => {
          const s = row.original.status;
          return <Badge type={productBadge({ status: s, isAvailable: true }).type}>{tp(`status.${s}`)}</Badge>;
        },
      },
      // The card has no updatedAt (API gap): the date is when the product was created.
      { id: 'date', header: t('cols.date'), meta: { width: 130, skeleton: 90 }, cell: ({ row }) => dayOf(row.original.createdAt, locale) },
    ],
    [t, tp, locale, nameOf, categoryName],
  );

  // shortcut: API gap, no search, category or availability filter on GET /v1/vendor/products: they apply to the loaded page (#52).
  const q = search.trim().toLowerCase();
  const rows =
    typeof data === 'object'
      ? data.items.filter(
          (p) =>
            (!categoryId || p.categoryId === categoryId) &&
            (!availability || availabilityOf(p) === availability) &&
            (q.length < 2 || [p.name.ar, p.name.en].some((v) => v.toLowerCase().includes(q))),
        )
      : [];
  const applied = [
    ...(status ? [{ key: 'status', label: tp('chip.status', { value: tp(`status.${status}`) }), onRemove: () => setStatus('') }] : []),
    ...(categoryId ? [{ key: 'category', label: tp('chip.category', { value: categoryName(categoryId) }), onRemove: () => setCategoryId('') }] : []),
    ...(availability ? [{ key: 'availability', label: t('chip', { value: t(`availability.${availability}`) }), onRemove: () => setAvailability('') }] : []),
  ];
  const filtered = applied.length > 0 || q.length >= 2;
  const clear = () => {
    setSearch('');
    setStatus('');
    setCategoryId('');
    setAvailability('');
  };
  const card = 'h-[360px]';
  const add = <Link href="/vendor/products/new" className={buttonVariants()}>{t('add')}</Link>;

  return (
    <>
      <PageHeader breadcrumb={t('breadcrumb')} title={t('title')} actions={add} />
      {data === 'blocked' ? (
        <StoreBlocked />
      ) : data !== 'error' && data !== 'loading' && !filtered && data.items.length === 0 && cursors.length === 1 ? (
        <StateCard kind="orders" className={card} title={t('empty.title')} body={t('empty.body')} action={<Link href="/vendor/products/new" className={buttonVariants({ variant: 'secondary' })}>{t('empty.action')}</Link>} />
      ) : (
        <>
          {rejected > 0 && data !== 'error' && <Notice text={t('rejectedNotice', { count: rejected })} />}
          {/* The error frame (131:25808) has no filters bar. */}
          {data !== 'error' && <FiltersBar search={search} onSearch={setSearch} searchLabel={t('search')} clearLabel={tp('clear')} applied={applied}>
            <Select aria-label={t('cols.availability')} value={availability} onChange={(e) => setAvailability(e.target.value as Availability | '')} className="flex-1">
              <option value="">{t('cols.availability')}</option>
              {(['available', 'hidden', 'out'] as const).map((a) => <option key={a} value={a}>{t(`availability.${a}`)}</option>)}
            </Select>
            <Select aria-label={tp('category')} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="flex-1">
              <option value="">{tp('category')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{nameOf(c.name)}</option>)}
            </Select>
            <Select aria-label={tp('statusFilter')} value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | '')} className="flex-1">
              <option value="">{tp('statusFilter')}</option>
              {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{tp(`status.${s}`)}</option>)}
            </Select>
            {/* shortcut: API gap, no date filter on GET /v1/vendor/products: shown disabled (#52). */}
            <span aria-disabled className="flex h-11 w-[160px] shrink-0 items-center justify-between gap-s8 rounded-sm border border-line bg-paper px-s12 text-body-m text-muted-soft">
              {t('cols.date')}
              <CalendarBlank size={18} aria-hidden />
            </span>
          </FiltersBar>}
          {data === 'error' ? (
            <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
          ) : data !== 'loading' && rows.length === 0 && cursors.length === 1 && !data.next ? (
            <StateCard kind="search" className={card} title={tp('empty.title')} body={tp('empty.body')} action={<Button variant="secondary" onClick={clear}>{tp('empty.action')}</Button>} />
          ) : (
            <DataTable
              tall
              label={t('title')}
              columns={columns}
              data={rows}
              status={data === 'loading' ? 'loading' : 'ready'}
              loadingRows={5}
              hasPrev={cursors.length > 1}
              hasNext={data !== 'loading' && !!data.next}
              onPrev={() => setCursors(cursors.slice(0, -1))}
              onNext={() => data !== 'loading' && data.next && setCursors([...cursors, data.next])}
              rowActions={(p) => (
                <RowMenu
                  label={t('menu.label', { name: nameOf(p.name) })}
                  disabled={busy === p.id}
                  items={[
                    { key: 'open', label: t(p.status === 'pending_review' ? 'menu.view' : 'menu.edit'), run: () => router.push(`/vendor/products/${p.id}`) },
                    ...(p.status === 'rejected' ? [{ key: 'notes', label: t('menu.notes'), run: () => router.push(`/vendor/products/${p.id}/review`) }] : []),
                    ...(p.status === 'draft' || p.status === 'rejected' ? [{ key: 'submit', label: t('menu.submit'), run: () => void act(p, 'submit') }] : []),
                    ...(p.status !== 'pending_review' ? [{ key: 'toggle', label: t(p.isAvailable ? 'menu.off' : 'menu.on'), run: () => void act(p, p.isAvailable ? 'off' : 'on') }] : []),
                  ]}
                />
              )}
            />
          )}
        </>
      )}
    </>
  );
}

/** The row's «⋯» (131:25074): a disclosure with the row's actions; Escape or a click outside closes it. */
function RowMenu({ label, items, disabled }: { label: string; items: { key: string; label: string; run: () => void }[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div ref={root} className="relative">
      <button type="button" aria-label={label} aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)} className="flex text-ink-2 disabled:opacity-50">
        <DotsThree size={22} aria-hidden />
      </button>
      {open && (
        <ul role="list" aria-label={label} className="absolute end-0 top-full z-10 mt-s4 flex w-[200px] flex-col rounded-sm border border-line bg-paper py-s4 shadow-card">
          {items.map((i) => (
            <li key={i.key}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  i.run();
                }}
                className="w-full px-s16 py-s8 text-start text-body-m text-ink hover:bg-bg"
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
