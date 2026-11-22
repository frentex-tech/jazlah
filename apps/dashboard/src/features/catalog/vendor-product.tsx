'use client';

import { Clock } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { StateCard } from '@/components/ui/state-card';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { dayOf } from '@/lib/date';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { uploadImage } from './client';
import { ProductForm, ProductFormSkeleton, SubmitError, type FormOptions, type ProductFormValues } from './product-form/product-form';
import { bodyOf, differsForReview, editedContent, priceChanges, priceField } from './product-form/values';
import type { Product } from './types';

const BASE = '/api/vendor/products';
const json = (method: string, body?: unknown) => ({ method, ...(body !== undefined && { body: JSON.stringify(body) }) });
/** Vendor calls that show a suspended store (VENDOR_SUSPENDED, 131:26015) on the page instead of leaving for sign-in. */
export const vendorFetch = <T,>(url: string, init?: RequestInit) => panelFetch<T>('vendor', url, { ...init, stayOn: ['VENDOR_SUSPENDED'] });

/**
 * The not-allowed frame (131:26015) with the suspended store's copy: the vendor routes answered VENDOR_SUSPENDED and the
 * session is already over on the server, so the action is a new sign-in (which says why), as on the store profile.
 * `form`: the product form's own copy (131:37786); the sign-in stays its action, since support has no destination yet.
 */
export function StoreBlocked({ form }: { form?: boolean }) {
  const t = useTranslations('vendorProducts.blocked');
  return (
    <StateCard kind="denied" className="h-[360px]" title={t(form ? 'formTitle' : 'title')} body={t(form ? 'formBody' : 'body')} action={<Link href="/login?panel=vendor&reason=suspended" className={buttonVariants({ variant: 'secondary' })}>{t('action')}</Link>} />
  );
}

/**
 * CAT-DSH-2: a vendor's product, new or edited, with the shared form (131:35405 frames) and the vendor endpoints:
 * POST /v1/vendor/products (a draft), PATCH …/prices, PUT …/{id} (content), PATCH …/fulfilment, …/availability,
 * POST …/submit. On a published product the content edit becomes a change request (the warning says so first);
 * prices, availability and fulfilment apply at once. Under review the form is read-only.
 */
export function VendorProduct({ id }: { id?: string }) {
  const t = useTranslations('vendorProducts.product');
  const locale = useLocale();
  const [state, setState] = useState<{ product: Product | null; options: FormOptions } | 'loading' | 'error' | 'missing' | 'blocked'>('loading');
  const [reReview, setReReview] = useState(false);
  const nameOf = (p: Product) => (locale === 'en' ? p.name.en : p.name.ar);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [product, options] = await Promise.all([id ? vendorFetch<Product>(`${BASE}/${id}`) : null, vendorFetch<FormOptions>('/api/vendor/catalog/options')]);
      setState({ product, options });
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setState(code === 'VENDOR_SUSPENDED' ? 'blocked' : code === 'NOT_FOUND' ? 'missing' : 'error');
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  const product = typeof state === 'object' ? state.product : null;
  const keep = (next: Product) => setState((s) => (typeof s === 'object' ? { ...s, product: next } : s));

  async function submit(values: ProductFormValues, intent: string): Promise<Product> {
    let p = product;
    // The other writes answer `changeRequest: null`: keep the request the GET or the PUT returned, so the form keeps
    // showing the proposed edit (ProductResponseDto.changeRequest).
    let request = product?.changeRequest ?? null;
    let contentSaved = false;
    try {
      if (!p) {
        p = await vendorFetch<Product>(BASE, json('POST', { ...values.content, fulfilment: values.fulfilment }));
        contentSaved = true;
        window.history.replaceState(null, '', window.location.pathname.replace(/\/new$/, `/${p.id}`));
      } else {
        const base = p;
        const prices = priceChanges(p, values.content);
        if (prices) {
          try {
            p = await vendorFetch<Product>(`${BASE}/${base.id}/prices`, json('PATCH', prices.body));
          } catch (e) {
            if (e instanceof ApiError && e.code === 'VALIDATION_FAILED' && Array.isArray(e.details)) {
              throw new ApiError(e.code, (e.details as { field?: string }[]).map((d) => ({ ...d, field: d.field && priceField(d.field, prices.rows) })));
            }
            throw e;
          }
        }
        // A published product: PUT only for a review-sensitive change (it opens a change request); price-only saves skip it.
        if (base.status !== 'published' || differsForReview(base, bodyOf(editedContent(base)), values.content)) {
          p = await vendorFetch<Product>(`${BASE}/${base.id}`, json('PUT', values.content));
          request = p.changeRequest;
          contentSaved = true;
        }
        if (values.fulfilment !== p.fulfilment) p = await vendorFetch<Product>(`${BASE}/${base.id}/fulfilment`, json('PATCH', { fulfilment: values.fulfilment }));
      }
      if (values.isAvailable !== p.isAvailable) p = await vendorFetch<Product>(`${BASE}/${p.id}/availability`, json('PATCH', { isAvailable: values.isAvailable }));
      if (intent === 'submit' && (p.status === 'draft' || p.status === 'rejected')) p = await vendorFetch<Product>(`${BASE}/${p.id}/submit`, json('POST'));
    } catch (e) {
      if (e instanceof ApiError && e.code === 'VENDOR_SUSPENDED') setState('blocked');
      const live = p === product ? null : p && { ...p, changeRequest: request };
      if (live) keep(live);
      throw new SubmitError(e, contentSaved && live ? live : undefined);
    }
    p = { ...p, changeRequest: request };
    keep(p);
    setReReview(false);
    const key = p.status === 'pending_review' ? 'submitted' : p.changeRequest?.status === 'pending' && contentSaved ? 'sentForReview' : 'saved';
    toast('success', t(key, { name: nameOf(p) }));
    return p;
  }

  const title = product ? nameOf(product) : t(id ? 'editTitle' : 'newTitle');
  const pending = product?.status === 'published' && product.changeRequest?.status === 'pending' ? product.changeRequest : null;
  const rejectedEdit = product?.status === 'published' && product.changeRequest?.status === 'rejected' ? product.changeRequest : null;
  const card = 'h-[360px]';
  return (
    <>
      <PageHeader breadcrumb={t(id ? 'breadcrumbEdit' : 'breadcrumbNew')} title={title} />
      {state === 'loading' ? (
        <ProductFormSkeleton label={t('loading')} />
      ) : state === 'blocked' ? (
        <StoreBlocked form />
      ) : state === 'missing' ? (
        <StateCard kind="search" className={card} title={t('missing.title')} body={t('missing.body')} action={<Link href="/vendor/products" className={buttonVariants({ variant: 'secondary' })}>{t('missing.action')}</Link>} />
      ) : state === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : (
        <>
          {product?.status === 'pending_review' && <Notice tone="sand" icon={Clock} text={t('underReview')} />}
          {product?.status === 'rejected' && (
            <Notice text={t('rejected')}>
              <Link href={`/vendor/products/${product.id}/review`} className={buttonVariants({ variant: 'secondary', size: 'S' })}>{t('notes')}</Link>
            </Notice>
          )}
          {pending && <Notice tone="sand" icon={Clock} text={t('editPending', { date: dayOf(pending.createdAt, locale) })} />}
          {rejectedEdit && (
            <Notice text={t('editRejected', { reason: rejectedEdit.rejectionReason ?? '' })}>
              <Link href={`/vendor/products/${product!.id}/review`} className={buttonVariants({ variant: 'secondary', size: 'S' })}>{t('notes')}</Link>
            </Notice>
          )}
          <ProductForm
            product={state.product}
            options={state.options}
            upload={(file) => uploadImage('vendor', 'catalog.product-image', file)}
            readOnly={product?.status === 'pending_review'}
            preferPending
            actions={
              product?.status === 'published'
                ? [{ intent: 'save', label: t('save'), variant: 'primary' }]
                : [
                    { intent: 'submit', label: t('submit'), variant: 'primary' },
                    { intent: 'draft', label: t('saveDraft'), variant: 'secondary' },
                  ]
            }
            deleteLabel={product ? t('delete') : undefined}
            onChange={(v) => product?.status === 'published' && setReReview(differsForReview(product, bodyOf(editedContent(product)), v.content))}
            notice={reReview && <Notice text={t('reReview')} />}
            onSubmit={submit}
          />
        </>
      )}
    </>
  );
}
