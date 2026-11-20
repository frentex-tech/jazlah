'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { StateCard } from '@/components/ui/state-card';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { loadAll, uploadAdminImage } from './client';
import { ProductForm, ProductFormSkeleton, SubmitError, type FormOptions, type ProductFormValues } from './product-form/product-form';
import { priceChanges } from './product-form/values';
import type { Packaging, Product, RefItem, Rule } from './types';

const BASE = '/api/admin/catalog';
const RULES = `${BASE}/incompatibilities`;
const json = (method: string, body?: unknown) => ({ method, ...(body !== undefined && { body: JSON.stringify(body) }) });

async function loadOptions(): Promise<FormOptions> {
  const list = (name: string) => loadAll<RefItem>(`${BASE}/lists/${name}`);
  const [categories, meatTypes, cuttingStyles, exclusionItems, rules] = await Promise.all([
    list('categories'), list('meat-types'), list('cutting-styles'), list('exclusion-items'), loadAll<Rule>(RULES),
  ]);
  // Oldest first, as the vendor lists are: newest-first pickers would move entries each time one is added.
  const old = (xs: RefItem[]) => xs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { categories: categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)), meatTypes: old(meatTypes), cuttingStyles: old(cuttingStyles), exclusionItems: old(exclusionItems), rules };
}

/** Admins edit the global rules from the matrix: add the pair, or delete its rule; then the rules as they stand. */
async function setRule(cuttingStyleId: string, packaging: Packaging, incompatible: boolean): Promise<Rule[]> {
  const rules = await loadAll<Rule>(RULES);
  const existing = rules.find((r) => r.cuttingStyleId === cuttingStyleId && r.packaging === packaging);
  if (incompatible && !existing) await panelFetch('admin', RULES, json('POST', { cuttingStyleId, packaging }));
  if (!incompatible && existing) await panelFetch('admin', `${RULES}/${existing.id}`, json('DELETE'));
  return loadAll<Rule>(RULES);
}

/**
 * CAT-DSH-1: a JAZLA product, new (131:35813) or edited (131:35405), with the shared product form and the admin
 * endpoints: POST /v1/admin/products (a draft), PUT …/{id} (content), PATCH …/prices, …/fulfilment, …/availability,
 * POST …/publish. States 131:37119 loading, 131:37423 error, 131:37786 not allowed.
 */
export function AdminProduct({ id }: { id?: string }) {
  const t = useTranslations('catalog.product');
  const locale = useLocale();
  const [state, setState] = useState<{ product: Product | null; options: FormOptions } | 'loading' | 'error' | 'denied' | 'missing'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [product, options] = await Promise.all([id ? panelFetch<Product>('admin', `${BASE}/products/${id}`) : null, loadOptions()]);
      setState({ product, options });
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setState(code === 'NOT_ALLOWED' ? 'denied' : code === 'NOT_FOUND' ? 'missing' : 'error');
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  const product = typeof state === 'object' ? state.product : null;
  const title = product ? (locale === 'en' ? product.name.en : product.name.ar) : t('newTitle');

  async function submit(values: ProductFormValues, intent: string): Promise<Product> {
    let p = product;
    const steps: (() => Promise<Product>)[] = [];
    if (!p) {
      p = await panelFetch<Product>('admin', `${BASE}/products`, json('POST', { ...values.content, fulfilment: values.fulfilment }));
      // The address of the product from now on, without reloading the form.
      window.history.replaceState(null, '', window.location.pathname.replace(/\/new$/, `/${p.id}`));
    } else {
      const prices = priceChanges(p, values.content);
      const id = p.id;
      if (prices) steps.push(() => panelFetch<Product>('admin', `${BASE}/products/${id}/prices`, json('PATCH', prices)));
      steps.push(() => panelFetch<Product>('admin', `${BASE}/products/${id}`, json('PUT', values.content)));
      if (values.fulfilment !== p.fulfilment) steps.push(() => panelFetch<Product>('admin', `${BASE}/products/${id}/fulfilment`, json('PATCH', { fulfilment: values.fulfilment })));
    }
    const id = p.id;
    if (values.isAvailable !== p.isAvailable) steps.push(() => panelFetch<Product>('admin', `${BASE}/products/${id}/availability`, json('PATCH', { isAvailable: values.isAvailable })));
    if (intent === 'publish' && p.status === 'draft') steps.push(() => panelFetch<Product>('admin', `${BASE}/products/${id}/publish`, json('POST')));
    const created = !product;
    try {
      for (const step of steps) p = await step();
    } catch (e) {
      if (created) setState((s) => (typeof s === 'object' ? { ...s, product: p } : s));
      throw new SubmitError(e, created ? p : undefined);
    }
    setState((s) => (typeof s === 'object' ? { ...s, product: p } : s));
    toast('success', t(p.status === 'published' ? 'published' : 'saved', { name: locale === 'en' ? p.name.en : p.name.ar }));
    return p;
  }

  const card = 'h-[360px]';
  return (
    <>
      <PageHeader start breadcrumb={t(product ? 'breadcrumbEdit' : 'breadcrumbNew')} title={title} />
      {state === 'loading' ? (
        <ProductFormSkeleton label={t('loading')} />
      ) : state === 'denied' ? (
        <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={<Link href="/admin" className={buttonVariants({ variant: 'secondary' })}>{t('denied.action')}</Link>} />
      ) : state === 'missing' ? (
        <StateCard kind="search" className={card} title={t('missing.title')} body={t('missing.body')} action={<Link href="/admin/catalog/products" className={buttonVariants({ variant: 'secondary' })}>{t('missing.action')}</Link>} />
      ) : state === 'error' ? (
        <StateCard kind="error" className={card} title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />
      ) : (
        <ProductForm
          product={state.product}
          options={state.options}
          upload={(file) => uploadAdminImage('catalog.product-image', file)}
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
