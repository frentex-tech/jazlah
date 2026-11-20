'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { DataTable } from '@/components/ui/data-table';
import { InputField } from '@/components/ui/form-field';
import { StateCard } from '@/components/ui/state-card';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import type { Vendor } from '@/features/admin-vendors/types';
import { Link } from '@/i18n/navigation';
import { dayOf } from '@/lib/date';
import { sar } from '@/lib/money';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { loadAll } from './client';
import { editedContent, liveContent } from './product-form/values';
import type { ChangeRequest, Product, ProductCard, ProductContentResponse, RefItem } from './types';

const BASE = '/api/admin/catalog';
/** Tells the side nav to count the queue again (lib: components/shell/side-nav.tsx). */
export const REVIEW_CHANGED = 'jazlah:review-changed';
const TABS = ['pending', 'approved', 'rejected'] as const;
type Tab = (typeof TABS)[number];
const PRESETS = ['image', 'description', 'price'] as const;

/** One row: a new product under review, an edit (change request) of a published one, or a decided product. */
type Item = { key: string; kind: 'new' | 'edit'; product: Product | null; card: ProductCard | null; request: ChangeRequest | null; vendor: string | null; sentAt: string };

/** `f` over `xs`, five at a time; a failure is kept as a rejected result instead of failing the whole list. */
async function settled<T, R>(xs: T[], f: (x: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < xs.length; i += 5) out.push(...(await Promise.allSettled(xs.slice(i, i + 5).map(f))));
  return out;
}

/** Hours or days since `iso`, for «الانتظار». */
export function waited(iso: string, now = Date.now()) {
  const hours = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 3_600_000));
  return hours < 24 ? { unit: 'hours' as const, n: hours } : { unit: 'days' as const, n: Math.floor(hours / 24) };
}

/** The parts of a published product an edit changes (its live content against the proposed one). */
function changedParts(live: ProductContentResponse, next: ProductContentResponse): string[] {
  const k = (x: unknown) => JSON.stringify(x);
  const parts: [string, unknown, unknown][] = [
    ['details', [live.name, live.description], [next.name, next.description]],
    ['category', [live.categoryId, live.meatTypeId], [next.categoryId, next.meatTypeId]],
    ['images', live.images.map((i) => i.mediaId), next.images.map((i) => i.mediaId)],
    ['sizes', live.sizes.map((s) => [s.id, s.approxWeightGrams, s.tag]), next.sizes.map((s) => [s.id, s.approxWeightGrams, s.tag])],
    ['cuts', live.cuttings.map((c) => c.cuttingStyleId), next.cuttings.map((c) => c.cuttingStyleId)],
    ['packs', live.packagings.map((c) => c.packaging), next.packagings.map((c) => c.packaging)],
    ['exclusions', live.exclusionItemIds, next.exclusionItemIds],
  ];
  return parts.filter(([, a, b]) => k(a) !== k(b)).map(([p]) => p);
}

/**
 * CAT-DSH-2: «مراجعة المنتجات» (131:22954 default, 131:23123 loading, 131:23351 empty, 131:23527 error, 131:23693 not
 * allowed, 131:23859 review dialog). The API has two queues and no combined one: new products are GET
 * /v1/admin/products?status=pending_review (decided with POST …/{id}/approve|reject), edits of published products are
 * GET /v1/admin/product-change-requests (POST …/{id}/approve|reject). The pending tab merges both, newest first.
 */
export function ReviewQueue() {
  const t = useTranslations('reviewQueue');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('pending');
  const [data, setData] = useState<Item[] | 'loading' | 'error' | 'denied'>('loading');
  const [lists, setLists] = useState<{ categories: RefItem[]; cuttingStyles: RefItem[] }>({ categories: [], cuttingStyles: [] });
  const [open, setOpen] = useState<Item | null>(null);
  const nameOf = useCallback((n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '—'), [locale]);

  useEffect(() => {
    loadAll<RefItem>('admin', `${BASE}/lists/categories`).then((categories) => setLists((l) => ({ ...l, categories })), () => {});
    loadAll<RefItem>('admin', `${BASE}/lists/cutting-styles`).then((cuttingStyles) => setLists((l) => ({ ...l, cuttingStyles })), () => {});
  }, []);
  // The vendors (names of an edit's store, JAZLA's id), read once; a failure is not kept, so a retry reads again.
  const vendorList = useRef<Vendor[] | null>(null);
  const vendors = useCallback(async () => (vendorList.current ??= await loadAll<Vendor>('admin', '/api/admin/vendors')), []);

  // shortcut: API gap (no combined queue): every page of both lists is loaded; an edit's product is read for its
  // store (five at a time). Fine for a review queue's size; page it if it grows.
  const load = useCallback(async () => {
    setData('loading');
    try {
      if (tab === 'pending') {
        const [cards, requests, known] = await Promise.all([
          loadAll<ProductCard>('admin', `${BASE}/products?status=pending_review`),
          loadAll<ChangeRequest>('admin', `${BASE}/change-requests`),
          vendors().catch(() => [] as Vendor[]), // names only: the rows still show without them
        ]);
        // A product that cannot be read leaves its row without a store; the dialog reads it again.
        const live = await settled(requests, (r) => panelFetch<Product>('admin', `${BASE}/products/${r.productId}`));
        const items: Item[] = [
          // The card has no submittedAt (API gap): a new product is dated by its creation; read when opened.
          ...cards.map((c) => ({ key: c.id, kind: 'new' as const, product: null, card: c, request: null, vendor: nameOf(c.vendor.name), sentAt: c.createdAt })),
          ...requests.map((r, i) => {
            const res = live[i]!;
            const p = res.status === 'fulfilled' ? res.value : null;
            return { key: r.id, kind: 'edit' as const, product: p, card: null, request: r, vendor: p ? nameOf(known.find((v) => v.id === p.vendorId)?.name) : null, sentAt: r.createdAt };
          }),
        ];
        setData(items.sort((a, b) => b.sentAt.localeCompare(a.sentAt)));
      } else {
        const platform = (await vendors()).find((v) => v.isPlatform)?.id;
        const cards = await loadAll<ProductCard>('admin', `${BASE}/products?status=${tab === 'approved' ? 'published' : 'rejected'}`);
        // The decided lists are the vendors' products; JAZLA's own are published without review.
        setData(cards.filter((c) => c.vendor.id !== platform).map((c) => ({ key: c.id, kind: 'new', product: null, card: c, request: null, vendor: nameOf(c.vendor.name), sentAt: c.createdAt })));
      }
    } catch (e) {
      setData(e instanceof ApiError && e.code === 'NOT_ALLOWED' ? 'denied' : 'error');
    }
  }, [tab, nameOf, vendors]);
  useEffect(() => void load(), [load]);

  const columns = useMemo<ColumnDef<Item, unknown>[]>(
    () => [
      {
        id: 'product',
        header: t('cols.product'),
        meta: { width: 300, skeleton: 150 },
        cell: ({ row: { original: r } }) => {
          const cover = r.request?.content.images[0]?.url ?? r.product?.images[0]?.url ?? r.card?.coverUrl;
          return (
            <span className="flex min-w-0 items-center gap-s12 text-label-m text-ink">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
                <img src={cover} alt="" className="size-11 shrink-0 rounded-sm object-cover" />
              ) : (
                <span aria-hidden className="size-11 shrink-0 rounded-sm bg-sand" />
              )}
              <span className="truncate">{nameOf(r.request?.content.name ?? r.product?.name ?? r.card?.name)}</span>
            </span>
          );
        },
      },
      { id: 'vendor', header: t('cols.vendor'), meta: { width: 160, skeleton: 90 }, cell: ({ row }) => row.original.vendor ?? '—' },
      {
        id: 'type',
        header: t('cols.type'),
        meta: { width: 140, skeleton: 80 },
        cell: ({ row }) => <Badge type={row.original.kind === 'new' ? 'neutral' : 'info'}>{t(`type.${row.original.kind}`)}</Badge>,
      },
      { id: 'sent', header: t('cols.sent'), meta: { width: 140, skeleton: 90 }, cell: ({ row }) => dayOf(row.original.sentAt, locale) },
      {
        id: 'waiting',
        header: t('cols.waiting'),
        meta: { width: 120, skeleton: 60 },
        cell: ({ row }) => {
          if (tab !== 'pending') return '—';
          const w = waited(row.original.sentAt);
          return t(`waited.${w.unit}`, { n: w.n });
        },
      },
      {
        id: 'action',
        header: '',
        meta: { width: 120, skeleton: 60 },
        cell: ({ row: { original: r } }) => (
          <Button size="S" variant="secondary" aria-label={t('openLabel', { name: nameOf(r.request?.content.name ?? r.product?.name ?? r.card?.name) })} onClick={() => setOpen(r)}>
            {t(tab === 'pending' ? 'open' : 'view')}
          </Button>
        ),
      },
    ],
    [t, locale, nameOf, tab],
  );

  const decided = (item: Item, message: string) => {
    toast('success', message);
    setOpen(null);
    setData((d) => (Array.isArray(d) ? d.filter((x) => x.key !== item.key) : d));
    window.dispatchEvent(new Event(REVIEW_CHANGED));
  };
  const stale = () => {
    toast('error', t('stale'));
    setOpen(null);
    void load();
    window.dispatchEvent(new Event(REVIEW_CHANGED));
  };

  const card = 'h-[360px]';
  return (
    <>
      <PageHeader start breadcrumb={t('breadcrumb')} title={t('title')} />
      {data === 'denied' ? (
        <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>} />
      ) : data === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : (
        <div className="flex flex-col gap-s24">
          <Tabs tabs={TABS.map((k) => ({ key: k, label: t(`tabs.${k}`) }))} value={tab} onChange={setTab} label={t('title')} controls="review-panel" idPrefix="review-tab" />
          <div id="review-panel" role="tabpanel" aria-labelledby={`review-tab-${tab}`}>
            {data !== 'loading' && data.length === 0 ? (
              <StateCard
                kind="search"
                className={card}
                title={t(`empty.${tab}`)}
                body={t(tab === 'pending' ? 'empty.body' : 'empty.decidedBody')}
                action={tab === 'pending' && <Button variant="secondary" onClick={() => setTab('approved')}>{t('empty.action')}</Button>}
              />
            ) : (
              <DataTable tall label={t(`tabs.${tab}`)} columns={columns} data={data === 'loading' ? [] : data} status={data === 'loading' ? 'loading' : 'ready'} loadingRows={4} hasPrev={false} hasNext={false} onPrev={() => {}} onNext={() => {}} />
            )}
          </div>
        </div>
      )}
      <ReviewDialog item={open} pending={tab === 'pending'} lists={lists} onClose={() => setOpen(null)} onDecided={decided} onStale={stale} />
    </>
  );
}

/** The review dialog (131:23859): the product as the customer would see it, then approve, or reject with a reason. */
function ReviewDialog({ item, pending, lists, onClose, onDecided, onStale }: {
  item: Item | null;
  pending: boolean;
  lists: { categories: RefItem[]; cuttingStyles: RefItem[] };
  onClose: () => void;
  onDecided: (item: Item, message: string) => void;
  onStale: () => void;
}) {
  const t = useTranslations('reviewQueue.dialog');
  const tf = useTranslations('catalog.form');
  const locale = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const nameOf = (n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '—');

  useEffect(() => {
    setReason('');
    setError(undefined);
    setProduct(item?.product ?? null);
    // Rows of new and decided products are cards, and an edit's product may have failed to load: read it when opened.
    const id = item && !item.product ? (item.request?.productId ?? item.card?.id) : undefined;
    if (id) panelFetch<Product>('admin', `${BASE}/products/${id}`).then(setProduct, () => setProduct(null));
  }, [item]);

  // An edit previews what approval makes live: the proposed content with the live prices of existing items.
  const content = product ? (item?.request ? editedContent({ ...product, changeRequest: item.request }) : liveContent(product)) : null;
  const name = nameOf(content?.name ?? item?.request?.content.name ?? item?.card?.name);
  const category = content && (lists.categories.find((c) => c.id === content.categoryId)?.name ?? (product?.category.id === content.categoryId ? product.category.name : null));
  // A change request's cuttings have no names: from the cutting styles, or the product's own.
  const cutName = (id: string) => lists.cuttingStyles.find((c) => c.id === id)?.name ?? product?.cuttings.find((c) => c.cuttingStyleId === id)?.name;
  const min = content?.sizes.length ? Math.min(...content.sizes.map((s) => s.priceHalalas)) : null;
  const list = (xs: string[]) => (xs.length ? xs.join(locale === 'en' ? ', ' : '، ') : '—');

  async function decide(action: 'approve' | 'reject') {
    if (!item) return;
    const r = reason.trim();
    if (action === 'reject' && (r.length === 0 || r.length > 500)) return setError(t(r.length ? 'tooLong' : 'required'));
    const url = item.request ? `${BASE}/change-requests/${item.request.id}/${action}` : `${BASE}/products/${item.key}/${action}`;
    setBusy(action);
    try {
      await panelFetch('admin', url, { method: 'POST', ...(action === 'reject' && { body: JSON.stringify({ reason: r }) }) });
      onDecided(item, t(action === 'approve' ? 'approved' : 'rejected', { name }));
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      if (code === 'VALIDATION_FAILED') setError(t('required'));
      else if (code === 'PRODUCT_NOT_EDITABLE' || code === 'NOT_FOUND' || code === 'PRODUCT_CHANGE_REQUEST_SUPERSEDED') onStale();
      else if (code === 'PRODUCT_NOT_SUBMITTABLE') toast('error', t('notSubmittable'));
      else toast('error', t('failed'));
    } finally {
      setBusy(null);
    }
  }

  const changes = item?.request && product ? changedParts(liveContent(product), item.request.content) : [];
  return (
    <Dialog.Root open={item !== null} onOpenChange={(o) => !o && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-scrim/55" />
        <Dialog.Content aria-describedby={undefined} className="fixed start-1/2 top-1/2 flex max-h-[90vh] w-[680px] -translate-y-1/2 flex-col gap-s16 overflow-y-auto rounded-lg bg-paper p-s24 shadow-card ltr:-translate-x-1/2 rtl:translate-x-1/2">
          <Dialog.Title className="text-h2 text-ink">{t('title', { name })}</Dialog.Title>
          <div className="flex items-start gap-s16">
            <dl className="flex min-w-0 flex-1 flex-col gap-s12">
              <Row label={t('vendor')} value={item?.vendor ?? '—'} />
              <Row label={t('category')} value={nameOf(category)} />
              <Row label={t('price')} value={min === null ? '—' : sar(min, locale)} />
              <Row label={t('sizes')} value={list(content?.sizes.map((s) => (s.tag ? nameOf(s.tag) : t('grams', { n: s.approxWeightGrams }))) ?? [])} />
              <Row label={t('cuts')} value={list(content?.cuttings.map((c) => nameOf(c.name ?? cutName(c.cuttingStyleId))) ?? [])} />
              <Row label={t('packs')} value={list(content?.packagings.map((k) => tf(`packaging.${k.packaging}`)) ?? [])} />
              {item?.request && <Row label={t('changes')} value={list(changes.map((c) => t(`part.${c}`)))} />}
              {!pending && product?.rejectionReason && product.status === 'rejected' && <Row label={t('reasonShown')} value={product.rejectionReason} />}
            </dl>
            {content?.images[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
              <img src={content.images[0].url} alt="" className="size-40 shrink-0 rounded-md object-cover" />
            ) : (
              <span aria-hidden className="size-40 shrink-0 rounded-md bg-sand" />
            )}
          </div>
          {pending && (
            <>
              <div role="group" aria-label={t('presets')} className="flex flex-wrap gap-s8">
                {PRESETS.map((p) => (
                  <Chip
                    key={p}
                    selected={reason === t(`presetText.${p}`)}
                    onClick={() => {
                      setReason(t(`presetText.${p}`));
                      setError(undefined);
                    }}
                  >
                    {t(`preset.${p}`)}
                  </Chip>
                ))}
              </div>
              <InputField
                label={t('reason')}
                hint={t('hint')}
                error={error}
                maxLength={500}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(undefined);
                }}
              />
            </>
          )}
          <div className="flex gap-s12">
            {pending && (
              <>
                <Button className="flex-1" loading={busy === 'approve'} disabled={!content || (busy !== null && busy !== 'approve')} onClick={() => void decide('approve')}>{t('approve')}</Button>
                <Button variant="danger" className="flex-1" loading={busy === 'reject'} disabled={!content || (busy !== null && busy !== 'reject')} onClick={() => void decide('reject')}>{t('reject')}</Button>
              </>
            )}
            <Dialog.Close asChild>
              <Button variant="secondary" className="flex-1" disabled={busy !== null}>{t('close')}</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-s12">
      <dt className="shrink-0 text-body-m text-ink-2">{label}</dt>
      <dd className="text-end text-label-m text-ink">{value}</dd>
    </div>
  );
}
