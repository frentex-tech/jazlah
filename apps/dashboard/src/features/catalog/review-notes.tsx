'use client';

import { CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { Link } from '@/i18n/navigation';
import { dayOf, timeOf } from '@/lib/date';
import { sar } from '@/lib/money';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/panel-fetch';
import { productBadge } from './products-list';
import type { Product } from './types';
import { StoreBlocked, vendorFetch } from './vendor-product';

const card = 'flex flex-col gap-s16 rounded-md border border-line bg-paper p-s24';

/** What the review team decided last: the product's own review, or the latest edit's (change request) on a published one. */
function decisionOf(p: Product) {
  const edit = p.status === 'published' ? p.changeRequest : null;
  if (edit?.status === 'rejected') return { kind: 'rejected' as const, reason: edit.rejectionReason, at: edit.reviewedAt };
  if (edit?.status === 'pending') return { kind: 'pending' as const, at: edit.createdAt };
  if (p.status === 'rejected') return { kind: 'rejected' as const, reason: p.rejectionReason, at: p.reviewedAt };
  if (p.status === 'pending_review') return { kind: 'pending' as const, at: p.submittedAt };
  if (p.status === 'published') return { kind: 'approved' as const, at: edit?.reviewedAt ?? p.reviewedAt };
  return { kind: 'draft' as const, at: null };
}

/**
 * CAT-DSH-2: «ملاحظات المراجعة» (131:38124 rejected, 131:38234 resubmitted, 131:38367 approved, 131:38500 loading,
 * 131:38579 error) from GET /v1/vendor/products/{id}: the reason of a rejected product (or of a rejected edit of a
 * published one), or where its review stands.
 */
export function ReviewNotes({ id }: { id: string }) {
  const t = useTranslations('vendorProducts.notes');
  const tp = useTranslations('catalog.products');
  const locale = useLocale();
  const [state, setState] = useState<Product | 'loading' | 'error' | 'missing' | 'blocked'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      setState(await vendorFetch<Product>(`/api/vendor/products/${id}`));
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setState(code === 'VENDOR_SUSPENDED' ? 'blocked' : code === 'NOT_FOUND' ? 'missing' : 'error');
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  const p = typeof state === 'object' ? state : null;
  const name = p ? (locale === 'en' ? p.name.en : p.name.ar) : '';
  const edit = `/vendor/products/${id}`;

  const body = () => {
    if (state === 'loading') {
      return (
        <div role="status" aria-label={t('loading')} className="flex w-full flex-col gap-s24">
          <Skeleton className="h-[120px]" />
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      );
    }
    if (state === 'blocked') return <StoreBlocked />;
    if (state === 'missing') {
      return <StateCard kind="search" className="h-[360px]" title={t('missing.title')} body={t('missing.body')} action={<Link href="/vendor/products" className={buttonVariants({ variant: 'secondary' })}>{t('missing.action')}</Link>} />;
    }
    if (state === 'error') {
      return <StateCard kind="error" className="h-[360px]" title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />;
    }
    const d = decisionOf(state);
    const badge = d.kind === 'rejected' ? { type: 'danger' as const, key: 'rejected' } : d.kind === 'pending' ? { type: 'info' as const, key: 'pending_review' } : productBadge({ status: state.status, isAvailable: true });
    return (
      <div className="flex items-start gap-s24">
        <section className={`${card} w-[360px] shrink-0`} aria-labelledby="notes-product">
          <h2 id="notes-product" className="text-h2 text-ink">{t('product')}</h2>
          {state.images[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
            <img src={state.images[0].url} alt="" className="h-[200px] w-full rounded-md object-cover" />
          ) : (
            <span aria-hidden className="h-[200px] w-full rounded-md bg-sand" />
          )}
          <dl className="flex flex-col gap-s12">
            <Row label={t('name')} value={name} />
            <Row label={t('category')} value={locale === 'en' ? state.category.name?.en : state.category.name?.ar} />
            <Row label={tp('cols.price')} value={state.minPriceHalalas === null ? '—' : sar(state.minPriceHalalas, locale)} />
            {/* shortcut: API gap, no submission count on a product: the «محاولات الإرسال» row is left out (#52). */}
          </dl>
        </section>
        <section className={`${card} min-w-0 flex-1`} aria-labelledby="notes-title">
          <h2 id="notes-title" className="text-h2 text-ink">{t('title')}</h2>
          <div className="flex items-center justify-between gap-s12">
            <span className="text-body-m text-ink-2">{d.at ? t('by', { date: dayOf(d.at, locale), time: timeOf(d.at, locale) }) : t('team')}</span>
            <Badge size="M" type={badge.type}>{tp(`status.${badge.key}`)}</Badge>
          </div>
          {d.kind === 'rejected' ? (
            <>
              <p className="text-body-m text-ink">{t('intro')}</p>
              {/* The API keeps one reason, not a list of issues: one issue card. */}
              <div className="flex items-start gap-s12 rounded-md bg-danger-bg p-s16">
                <WarningCircle size={24} weight="fill" aria-hidden className="shrink-0 text-danger" />
                <div className="flex min-w-0 flex-1 flex-col gap-s4">
                  <span className="text-label-m text-ink">{t('reason')}</span>
                  <p className="whitespace-pre-line text-body-m text-ink">{d.reason}</p>
                </div>
                <Link href={edit} className={buttonVariants({ variant: 'secondary', size: 'S' })}>{t('fix')}</Link>
              </div>
              <div className="flex gap-s12">
                <Link href={edit} className={cn(buttonVariants(), 'w-[224px]')}>{t('resubmit')}</Link>
                {/* shortcut: API gap, products cannot be deleted (no DELETE endpoint); shown disabled (#52). */}
                <Button variant="ghost" className="w-[224px]" disabled>{t('delete')}</Button>
              </div>
            </>
          ) : (
            <Notice tone="sand" icon={d.kind === 'approved' ? CheckCircle : Clock} text={t(`state.${d.kind}`)} />
          )}
        </section>
      </div>
    );
  };

  return (
    <>
      <PageHeader start breadcrumb={t('breadcrumb', { name: name || '…' })} title={t('heading')} />
      {body()}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-s12">
      <dt className="text-body-m text-ink-2">{label}</dt>
      <dd className="text-end text-label-m text-ink">{value}</dd>
    </div>
  );
}
