'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormField, InputField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import type { Vendor } from '@/features/admin-vendors/types';
import { fieldErrors, loadAll } from '@/features/catalog/client';
import { bySortOrder, type RefItem } from '@/features/catalog/types';
import { Link, useRouter } from '@/i18n/navigation';
import { sar } from '@/lib/money';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { STATUS_BADGE } from './coupons-list';
import { CouponSchema, emptyDraft, errorKey, fromDraft, localOf, toDraft, zodErrors, type Draft, type FieldErrors } from './schema';
import { COUPON_TYPES, type Coupon, type CouponUsage } from './types';

const BASE = '/api/admin/coupons';
const LIST = '/admin/marketing/coupons';
const grid = 'grid grid-cols-[repeat(2,342px)] gap-x-s24 gap-y-s20';
type Options = { vendors: Vendor[]; categories: RefItem[] };
type Loaded = { coupon: Coupon | null; usage: CouponUsage | null };

/**
 * CRT-DSH-1: a new coupon, or one coupon with its usage, edit and deactivate (no Figma frame; the form sections of the
 * operations settings and product form). POST /v1/admin/coupons, PATCH …/{id}, GET …/{id}/usage.
 */
export function CouponPage({ id }: { id?: string }) {
  const t = useTranslations('coupons');
  const te = useTranslations('coupons.errors');
  const locale = useLocale();
  const router = useRouter();
  const [state, setState] = useState<Loaded | 'loading' | 'error' | 'denied' | 'missing'>('loading');
  const [options, setOptions] = useState<Options>({ vendors: [], categories: [] });
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [coupon, usage] = id ? await Promise.all([panelFetch<Coupon>('admin', `${BASE}/${id}`), panelFetch<CouponUsage>('admin', `${BASE}/${id}/usage`)]) : [null, null];
      setState({ coupon, usage });
      setDraft(coupon ? toDraft(coupon) : emptyDraft());
      setErrors({});
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      setState(code === 'NOT_ALLOWED' ? 'denied' : code === 'NOT_FOUND' ? 'missing' : 'error');
    }
  }, [id]);
  useEffect(() => void load(), [load]);
  // The multi-selects' options: every vendor (JAZLA included; suspended ones shown only when selected) and categories; a failure leaves a list empty.
  useEffect(() => {
    loadAll<Vendor>('admin', '/api/admin/vendors').then((vendors) => setOptions((o) => ({ ...o, vendors })), () => {});
    loadAll<RefItem>('admin', '/api/admin/catalog/lists/categories').then((c) => setOptions((o) => ({ ...o, categories: c.sort(bySortOrder) })), () => {});
  }, []);

  const coupon = typeof state === 'object' ? state.coupon : null;
  const header = (actions?: React.ReactNode) => <PageHeader breadcrumb={t('formBreadcrumb')} title={coupon?.code ?? t(id ? 'editTitle' : 'newTitle')} actions={actions} />;
  const card = 'h-[360px]';
  const back = <Link href={LIST} className={buttonVariants({ variant: 'secondary' })}>{t('back')}</Link>;

  if (typeof state !== 'object') {
    return (
      <>
        {header()}
        {state === 'error' && <StateCard kind="error" className={card} title={t('formError.title')} body={t('formError.body')} action={<Button onClick={() => void load()}>{t('error.action')}</Button>} />}
        {state === 'denied' && <StateCard kind="denied" className={card} title={t('denied.title')} body={t('denied.body')} action={back} />}
        {state === 'missing' && <StateCard kind="search" className={card} title={t('missing.title')} body={t('missing.body')} action={back} />}
        {state === 'loading' && (
          <div role="status" aria-label={t('loading')} className="flex w-full flex-col gap-s24">
            {[160, 320, 360, 280].map((h) => <Skeleton key={h} style={{ height: h }} />)}
          </div>
        )}
      </>
    );
  }

  const d = draft;
  const err = (k: string) => (errors[k] ? te(errorKey(k, errors[k]!, d.type)) : undefined);
  const invalid = (...keys: string[]) => Object.keys(errors).some((k) => keys.some((p) => k === p || k.startsWith(`${p}.`)));
  // A change clears the field's error; dates clear each other's («end before start» belongs to both).
  const edit = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((o) => ({ ...o, [k]: v }));
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([f]) => f !== k && !f.startsWith(`${k}.`) && !(k.endsWith('sAt') && f.endsWith('sAt')) && !(k === 'type' && f === 'value'))));
  };
  const text = (k: keyof Draft, label: string, hint?: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <InputField label={label} hint={hint} error={err(k)} value={d[k] as string} onChange={(e) => edit(k, e.target.value as never)} {...extra} />
  );
  const toggle = (k: 'vendorIds' | 'categoryIds', v: string) => edit(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);
  const name = (n: { ar: string; en: string }) => (locale === 'en' ? n.en : n.ar);

  function failed(e: unknown) {
    const fields = fieldErrors(e);
    if (e instanceof ApiError && e.code === 'COUPON_CODE_TAKEN') {
      setErrors({ code: 'taken' });
      toast('error', t('invalid'));
    } else if (fields) {
      setErrors(fields);
      toast('error', t('invalid'));
    } else if (e instanceof ApiError && e.code === 'NOT_ALLOWED') setState('denied');
    else toast('error', t('failed'));
  }

  async function save() {
    const parsed = CouponSchema.safeParse(fromDraft(d));
    if (!parsed.success) {
      setErrors(zodErrors(parsed.error));
      return toast('error', t('invalid'));
    }
    setSaving(true);
    try {
      // An edit leaves out dates not touched: the form drops seconds, so sending them back would rewrite the stored times.
      const body = { ...parsed.data } as Partial<typeof parsed.data>;
      if (coupon && d.startsAt === localOf(coupon.startsAt)) delete body.startsAt;
      if (coupon && d.endsAt === localOf(coupon.endsAt)) delete body.endsAt;
      const c = await panelFetch<Coupon>('admin', coupon ? `${BASE}/${coupon.id}` : BASE, { method: coupon ? 'PATCH' : 'POST', body: JSON.stringify(body) });
      toast('success', t(coupon ? 'saved' : 'created', { code: c.code }));
      if (coupon) {
        setState((s) => (typeof s === 'object' ? { ...s, coupon: c } : s));
        setDraft(toDraft(c));
        setErrors({});
      } else router.push(`${LIST}/${c.id}`);
    } catch (e) {
      failed(e);
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!coupon) return;
    setSaving(true);
    try {
      const c = await panelFetch<Coupon>('admin', `${BASE}/${coupon.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
      setState((s) => (typeof s === 'object' ? { ...s, coupon: c } : s));
      setDraft((o) => ({ ...o, isActive: false }));
      toast('success', t('deactivated', { code: c.code }));
    } catch (e) {
      failed(e);
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  const usage = state.usage;
  // Inactive or unknown entries stay listed while selected, so they can be removed.
  const picks = (ids: string[], items: { id: string; name: { ar: string; en: string }; shown: boolean }[]) => [
    ...items.filter((x) => x.shown || ids.includes(x.id)).map((x) => [x.id, name(x.name)] as const),
    ...ids.filter((id) => !items.some((x) => x.id === id)).map((id) => [id, t('form.unavailable')] as const),
  ];
  const vendorPicks = picks(d.vendorIds, options.vendors.map((v) => ({ ...v, shown: v.status === 'active' })));
  const categoryPicks = picks(d.categoryIds, options.categories.map((c) => ({ ...c, shown: c.isActive })));
  const listError = (k: string) => Object.keys(errors).find((f) => f === k || f.startsWith(`${k}.`));
  return (
    <>
      {header(
        coupon && (
          <>
            <Badge type={STATUS_BADGE[coupon.status]} size="M" className="self-center">{t(`statuses.${coupon.status}`)}</Badge>
            {coupon.isActive && <Button variant="secondary" onClick={() => setConfirming(true)}>{t('deactivate')}</Button>}
          </>
        ),
      )}
      <form
        noValidate
        className="flex w-full flex-col gap-s24"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {coupon && usage && (
          <FormSection hug title={t('usage.title')} body={t('usage.body')}>
            <dl className="grid grid-cols-3 gap-s16">
              {[
                ['uses', coupon.usageLimit === null ? t('usageNoLimit', { used: usage.uses }) : t('usageOf', { used: usage.uses, limit: coupon.usageLimit })],
                ['users', String(usage.distinctUsers)],
                ['discount', sar(usage.totalDiscountHalalas, locale)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-s4 rounded-md border border-line bg-paper px-s16 py-s12">
                  <dt className="text-body-m text-ink-2">{t(`usage.${k}`)}</dt>
                  <dd className="text-h2 text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </FormSection>
        )}

        <FormSection hug title={t('form.discount.title')} body={t('form.discount.body')} invalid={invalid('code', 'type', 'value', 'maxDiscountHalalas')}>
          <div className={grid}>
            {text('code', t('form.code'), t('form.codeHint'), { dir: 'ltr', className: 'uppercase rtl:text-end', maxLength: 32, autoComplete: 'off' })}
            <FormField label={t('form.type')}>
              {({ id: fid }) => (
                <Select id={fid} className="h-[52px] w-full" value={d.type} onChange={(e) => edit('type', e.target.value as Draft['type'])}>
                  {COUPON_TYPES.map((k) => <option key={k} value={k}>{t(`types.${k}`)}</option>)}
                </Select>
              )}
            </FormField>
            {text('value', t(d.type === 'percent' ? 'form.percent' : 'form.amount'), t(d.type === 'percent' ? 'form.percentHint' : 'form.amountHint'), { inputMode: d.type === 'percent' ? 'numeric' : 'decimal' })}
            {d.type === 'percent' && text('maxDiscountHalalas', t('form.maxDiscount'), t('form.optionalHint'), { inputMode: 'decimal' })}
          </div>
        </FormSection>

        <FormSection hug title={t('form.conditions.title')} body={t('form.conditions.body')} invalid={invalid('minOrderHalalas', 'vendorIds', 'categoryIds')}>
          <div className={grid}>{text('minOrderHalalas', t('form.minOrder'), t('form.optionalHint'), { inputMode: 'decimal' })}</div>
          {(
            [
              ['vendorIds', t('form.vendors'), t('form.vendorsHint'), vendorPicks],
              ['categoryIds', t('form.categories'), t('form.categoriesHint'), categoryPicks],
            ] as const
          ).map(([k, legend, hint, items]) => (
            <fieldset key={k} className="flex flex-col gap-s8">
              <legend className="mb-s8 text-label-m text-ink-2">{legend}</legend>
              <div className="flex flex-wrap gap-s8">
                {items.map(([v, label]) => (
                  <Chip key={v} selected={d[k].includes(v)} onClick={() => toggle(k, v)}>{label}</Chip>
                ))}
              </div>
              <p className="text-body-m text-muted">{d[k].length ? t('form.selected', { count: d[k].length }) : hint}</p>
              {listError(k) && <p role="alert" className="text-body-m text-danger">{err(listError(k)!)}</p>}
            </fieldset>
          ))}
          {/* Decision 25: the first-order discount is off for now; shown disabled and never sent. */}
          <div className="flex items-center gap-s12">
            <Switch label={t('form.firstOrderOnly')} checked={false} disabled onChange={() => {}} />
            <Badge type="neutral" size="M">{t('form.firstOrderOnlySoon')}</Badge>
          </div>
        </FormSection>

        <FormSection hug title={t('form.period.title')} body={t('form.period.body')} invalid={invalid('startsAt', 'endsAt', 'usageLimit', 'perUserLimit')}>
          <div className={grid}>
            {text('startsAt', t('form.startsAt'), t('form.riyadh'), { type: 'datetime-local', dir: 'ltr', className: 'rtl:text-end' })}
            {text('endsAt', t('form.endsAt'), t('form.riyadh'), { type: 'datetime-local', dir: 'ltr', className: 'rtl:text-end' })}
            {text('usageLimit', t('form.usageLimit'), t('form.unlimitedHint'), { inputMode: 'numeric' })}
            {text('perUserLimit', t('form.perUserLimit'), t('form.unlimitedHint'), { inputMode: 'numeric' })}
          </div>
        </FormSection>

        <FormSection hug title={t('form.state.title')} body={t('form.state.body')}>
          <Switch label={t('form.isActive')} checked={d.isActive} onChange={(v) => edit('isActive', v)} />
        </FormSection>

        <div className="flex justify-end gap-s12 rounded-md border border-line bg-paper px-s24 py-s16">
          <Button type="submit" loading={saving}>{t(coupon ? 'save' : 'create')}</Button>
          <Link href={LIST} className={buttonVariants({ variant: 'secondary' })}>{t('cancel')}</Link>
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        destructive
        // The Latin code isolated, so the Arabic question mark stays at the end.
        title={t('confirm.title', { code: `\u2066${coupon?.code ?? ''}\u2069` })}
        body={t('confirm.body')}
        confirmLabel={t('confirm.action')}
        loading={saving}
        onConfirm={() => void deactivate()}
      />
    </>
  );
}
