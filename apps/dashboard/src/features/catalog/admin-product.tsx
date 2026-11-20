'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { StateCard } from '@/components/ui/state-card';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { loadAll, uploadImage } from './client';
import { ProductForm, ProductFormSkeleton, SubmitError, type FormOptions, type ProductFormValues } from './product-form/product-form';
import { priceChanges, priceField } from './product-form/values';
import type { Review } from '@/features/admin-vendors/types';
import { bySortOrder, type Packaging, type Product, type RefItem, type Rule } from './types';

const BASE = '/api/admin/catalog';
const RULES = `${BASE}/incompatibilities`;
const json = (method: string, body?: unknown) => ({ method, ...(body !== undefined && { body: JSON.stringify(body) }) });

async function loadOptions(): Promise<FormOptions> {
  const list = (name: string) => loadAll<RefItem>('admin', `${BASE}/lists/${name}`);
  const [categories, meatTypes, cuttingStyles, exclusionItems, rules] = await Promise.all([
    list('categories'), list('meat-types'), list('cutting-styles'), list('exclusion-items'), loadAll<Rule>('admin', RULES),
  ]);
  // Oldest first, as the vendor lists are: newest-first pickers would move entries each time one is added.
  const old = (xs: RefItem[]) => xs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { categories: categories.sort(bySortOrder), meatTypes: old(meatTypes), cuttingStyles: old(cuttingStyles), exclusionItems: old(exclusionItems), rules };
}

/** Admins edit the global rules from the matrix: add the pair, or delete its rule; then the rules as they stand. */
async function setRule(cuttingStyleId: string, packaging: Packaging, incompatible: boolean): Promise<Rule[]> {
  const rules = await loadAll<Rule>('admin', RULES);
  const existing = rules.find((r) => r.cuttingStyleId === cuttingStyleId && r.packaging === packaging);
  if (incompatible && !existing) await panelFetch('admin', RULES, json('POST', { cuttingStyleId, packaging }));
  if (!incompatible && existing) await panelFetch('admin', `${RULES}/${existing.id}`, json('DELETE'));
  return loadAll<Rule>('admin', RULES);
}

/**
 * CAT-DSH-1: a JAZLA product, new (131:35813) or edited (131:35405), with the shared product form and the admin
 * endpoints: POST /v1/admin/products (a draft), PUT …/{id} (content), PATCH …/prices, …/fulfilment, …/availability,
 * POST …/publish. States 131:37119 loading, 131:37423 error, 131:37786 not allowed.
 */
export function AdminProduct({ id }: { id?: string }) {
  const t = useTranslations('catalog.product');
  const locale = useLocale();
  const [state, setState] = useState<{ product: Product | null; options: FormOptions } | 'loading' | 'error' | 'denied' | 'missing' | 'foreign'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [product, options] = await Promise.all([id ? panelFetch<Product>('admin', `${BASE}/products/${id}`) : null, loadOptions()]);
      // Admins edit JAZLA's own products only; another store's is reviewed (CAT-DSH-2). If the vendor cannot be read,
      // the form opens and the API refuses an edit that is not allowed.
      const review = product ? await panelFetch<Review>('admin', `/api/admin/vendors/${product.vendorId}`).catch(() => null) : null;
      setState(review?.vendor && !review.vendor.isPlatform ? 'foreign' : { product, options });
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setState(code === 'NOT_ALLOWED' ? 'denied' : code === 'NOT_FOUND' ? 'missing' : 'error');
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  const product = typeof state === 'object' ? state.product : null;
  const title = product ? (locale === 'en' ? product.name.en : product.name.ar) : t(id ? 'editTitle' : 'newTitle');

  async function submit(values: ProductFormValues, intent: string): Promise<Product> {
    let p = product;
    let contentSaved = false; // the create or the content edit went through: the sizes now have their ids
    const keep = (next: Product) => setState((s) => (typeof s === 'object' ? { ...s, product: next } : s));
    const fail = (e: unknown, live: Product | null) => {
      // Keep what the server returned, so a retry edits the live product (its prices, its new sizes).
      if (live) keep(live);
      return new SubmitError(e, contentSaved && live ? live : undefined);
    };
    try {
      if (!p) {
        p = await panelFetch<Product>('admin', `${BASE}/products`, json('POST', { ...values.content, fulfilment: values.fulfilment }));
        contentSaved = true;
        // The address of the product from now on, without reloading the form.
        window.history.replaceState(null, '', window.location.pathname.replace(/\/new$/, `/${p.id}`));
      } else {
        const id = p.id;
        const prices = priceChanges(p, values.content);
        if (prices) {
          try {
            p = await panelFetch<Product>('admin', `${BASE}/products/${id}/prices`, json('PATCH', prices.body));
          } catch (e) {
            // The PATCH's items are only the changed prices: put its field paths back on the form's rows.
            if (e instanceof ApiError && e.code === 'VALIDATION_FAILED' && Array.isArray(e.details)) {
              throw new ApiError(e.code, (e.details as { field?: string }[]).map((d) => ({ ...d, field: d.field && priceField(d.field, prices.rows) })));
            }
            throw e;
          }
        }
        p = await panelFetch<Product>('admin', `${BASE}/products/${id}`, json('PUT', values.content));
        contentSaved = true;
        if (values.fulfilment !== p.fulfilment) p = await panelFetch<Product>('admin', `${BASE}/products/${id}/fulfilment`, json('PATCH', { fulfilment: values.fulfilment }));
      }
      if (values.isAvailable !== p.isAvailable) p = await panelFetch<Product>('admin', `${BASE}/products/${p.id}/availability`, json('PATCH', { isAvailable: values.isAvailable }));
      if (intent === 'publish' && p.status === 'draft') p = await panelFetch<Product>('admin', `${BASE}/products/${p.id}/publish`, json('POST'));
    } catch (e) {
      throw fail(e, p === product ? null : p);
    }
    keep(p);
    toast('success', t(p.status === 'published' && intent === 'publish' ? 'published' : 'saved', { name: locale === 'en' ? p.name.en : p.name.ar }));
    return p;
  }

  const card = 'h-[360px]';
  return (
    <>
      <PageHeader start breadcrumb={t(product || id ? 'breadcrumbEdit' : 'breadcrumbNew')} title={title} />
      {state === 'loading' ? (
        <ProductFormSkeleton label={t('loading')} />
      ) : state === 'denied' ? (
        <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>} />
      ) : state === 'foreign' ? (
        <StateCard kind="search" className={card} title={t('foreign.title')} body={t('foreign.body')} action={<Link href="/admin/catalog/products" className={buttonVariants({ variant: 'secondary' })}>{t('missing.action')}</Link>} />
      ) : state === 'missing' ? (
        <StateCard kind="search" className={card} title={t('missing.title')} body={t('missing.body')} action={<Link href="/admin/catalog/products" className={buttonVariants({ variant: 'secondary' })}>{t('missing.action')}</Link>} />
      ) : state === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : (
        <ProductForm
          product={state.product}
          options={state.options}
          upload={(file) => uploadImage('admin', 'catalog.product-image', file)}
          setRule={setRule}
          actions={
            !product || product.status === 'draft'
              ? [
                  { intent: 'publish', label: t('publish'), variant: 'primary' },
                  { intent: 'draft', label: t('saveDraft'), variant: 'secondary' },
                ]
              : [{ intent: 'save', label: t('save'), variant: 'primary' }]
          }
          deleteLabel={product ? t('delete') : undefined}
          onSubmit={submit}
        />
      )}
    </>
  );
}
