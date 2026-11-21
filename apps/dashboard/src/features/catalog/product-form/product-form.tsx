'use client';

import { CaretDown, Trash } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { FormField, InputField, fieldClass } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { fieldErrors } from '../client';
import { MAX_IMAGES, PACKAGINGS, type Packaging, type Product, type RefItem, type Rule } from '../types';
import { Gallery } from './gallery';
import { Matrix } from './matrix';
import { SmallInput } from './small-input';
import { emptySize, stateOf, toValues, type Errors, type FormState, type ProductFormValues } from './values';

export type { ProductFormValues } from './values';

/** The pickers' entries and the global cutting × packaging rules, loaded by the page (admin or vendor endpoints). */
export type FormOptions = { categories: RefItem[]; meatTypes: RefItem[]; cuttingStyles: RefItem[]; exclusionItems: RefItem[]; rules: Rule[] };

/**
 * A failed submit. `product` is set when the content itself was saved (the create or the content edit went through,
 * a later step failed): its sizes are in the submitted order, so the form takes their new ids and a retry is an edit.
 */
export class SubmitError extends Error {
  constructor(
    readonly cause: unknown,
    readonly product?: Product,
  ) {
    super('submit failed');
  }
}

export type ProductFormProps = {
  product: Product | null;
  options: FormOptions;
  /** Uploads one image (ticket, storage, confirm) with the page's session; resolves to the confirmed media id. */
  upload: (file: File) => Promise<string>;
  /** Admins edit the global rules from the matrix; without it the matrix is read-only (vendors). Resolves to the new rules. */
  setRule?: (rules: Rule[], cuttingStyleId: string, packaging: Packaging, incompatible: boolean) => Promise<Rule[]>;
  /** The footer's buttons: each submits with its intent (e.g. «draft», «publish»). */
  actions: { intent: string; label: string; variant: 'primary' | 'secondary' }[];
  deleteLabel?: string;
  /** Saves; resolves to the product as saved, or throws (ApiError, SubmitError) for the form to show on its fields. */
  onSubmit: (values: ProductFormValues, intent: string) => Promise<Product>;
  /** Nothing can be changed (a vendor product under review): fields disabled, no footer. */
  readOnly?: boolean;
  /** Each change of the fields, as the values a submit would send (e.g. to warn that an edit will be re-reviewed). */
  onChange?: (values: ProductFormValues) => void;
  /** Shown above the footer (e.g. the «will be re-reviewed» warning). */
  notice?: React.ReactNode;
  /** Open on a published product's pending change request, not the live content (the vendor's proposed edit). */
  preferPending?: boolean;
};

const SECTION_OF: [string, RegExp][] = [
  ['basics', /^(name|description|categoryId|meatTypeId)/],
  ['images', /^imageMediaIds/],
  ['sizes', /^sizes/],
  ['cuts', /^cuttings/],
  ['packs', /^packagings/],
  ['exclusions', /^exclusionItemIds/],
  ['matrix', /^pairs/],
  ['fulfilment', /^fulfilment/],
];
const sectionOf = (key: string) => SECTION_OF.find(([, re]) => re.test(key))?.[0];

/** The loading frame of the form (131:37119): one tall block, then five bars. */
export function ProductFormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex w-full flex-col gap-s24">
      <Skeleton className="h-[120px]" />
      {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}
    </div>
  );
}

/**
 * The product form shared by the admin (JAZLA products, CAT-DSH-1) and the vendor (CAT-DSH-2): 131:35405 edit,
 * 131:35813 new, 131:36439 validation. It knows no endpoint: the page passes the options, the upload, the rules
 * editor and the submit. Errors from the API (VALIDATION_FAILED paths, PRODUCT_NOT_SUBMITTABLE) land on the fields.
 */
export function ProductForm({ product, options, upload, setRule, actions, deleteLabel, onSubmit, readOnly, onChange, notice, preferPending }: ProductFormProps) {
  const t = useTranslations('catalog.form');
  const tg = useTranslations();
  const locale = useLocale();
  const [s, setS] = useState<FormState>(() => stateOf(product, preferPending));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [rules, setRules] = useState(options.rules);
  const name = (n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '');
  const changed = useRef(onChange);
  changed.current = onChange;
  useEffect(() => {
    changed.current?.(toValues(s).values);
  }, [s]);

  const set = (patch: Partial<FormState>, clear: string[] = []) => {
    setS((old) => ({ ...old, ...patch }));
    if (clear.length) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !clear.some((c) => k === c || k.startsWith(`${c}.`)))));
  };
  // Entries a product already uses stay listed even when switched off since (the API keeps them on the product).
  const listed = (all: RefItem[], used: string[]) => all.filter((x) => x.isActive || used.includes(x.id));
  const cuttingStyles = listed(options.cuttingStyles, s.cuts.map((c) => c.id));
  const exclusionItems = listed(options.exclusionItems, s.exclusions);
  const categories = listed(options.categories, [s.categoryId]);
  const meatTypes = listed(options.meatTypes, [s.meatTypeId]);

  async function submit(intent: string) {
    const { values, errors: own } = toValues(s);
    setErrors(own);
    if (Object.keys(own).length) return;
    setBusy(intent);
    try {
      setS(stateOf(await onSubmit(values, intent), preferPending));
    } catch (err) {
      const cause = err instanceof SubmitError ? err.cause : err;
      const saved = err instanceof SubmitError ? err.product : undefined;
      // Keep what was typed; only the new sizes take the ids the server gave them (by position).
      if (saved) setS((old) => ({ ...old, sizes: old.sizes.map((r, i) => ({ ...r, id: saved.sizes[i]?.id ?? r.id })) }));
      const mapped = errorsOf(cause, values);
      if (mapped) setErrors(mapped);
      else toast('error', t('saveFailed'));
    } finally {
      setBusy(null);
    }
  }

  const message = (key: string) => {
    const c = errors[key];
    if (!c) return undefined;
    if (c === 'required') {
      const leaf = key.startsWith('sizes.') ? key.split('.')[2]! : key;
      return t.has(`required.${leaf}`) ? t(`required.${leaf}`) : tg('form.required');
    }
    return t.has(`constraint.${c}`) ? t(`constraint.${c}`) : tg('form.invalid');
  };
  const invalid = (section: string) => Object.keys(errors).some((k) => sectionOf(k) === section);

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-s24"
      onSubmit={(e) => {
        e.preventDefault();
        const intent = actions.find((a) => a.variant === 'primary')?.intent ?? actions[0]?.intent;
        if (!busy && !readOnly && intent) void submit(intent);
      }}
    >
      <fieldset disabled={readOnly} className="contents">
      <FormSection title={t('basics.title')} body={t('basics.body')} invalid={invalid('basics')}>
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('basics.nameAr')} hint={t('basics.nameHint')} placeholder={t('placeholder')} maxLength={100} value={s.nameAr} error={message('name.ar')} onChange={(e) => set({ nameAr: e.target.value }, ['name.ar'])} />
          <InputField label={t('basics.nameEn')} hint={t('basics.nameHint')} placeholder={t('placeholder')} maxLength={100} dir="ltr" value={s.nameEn} error={message('name.en')} onChange={(e) => set({ nameEn: e.target.value }, ['name.en'])} />
        </div>
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('basics.descAr')} hint={t('basics.descHint')} placeholder={t('placeholder')} maxLength={1000} value={s.descAr} error={message('description.ar')} onChange={(e) => set({ descAr: e.target.value }, ['description.ar'])} />
          <InputField label={t('basics.descEn')} hint={t('basics.descHint')} placeholder={t('placeholder')} maxLength={1000} dir="ltr" value={s.descEn} error={message('description.en')} onChange={(e) => set({ descEn: e.target.value }, ['description.en'])} />
        </div>
        <div className="grid grid-cols-2 gap-s24">
          <SelectField label={t('basics.category')} hint={t('basics.categoryHint')} error={message('categoryId')} value={s.categoryId} onChange={(v) => set({ categoryId: v }, ['categoryId'])}>
            <option value="">{t('choose')}</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{name(c.name)}</option>)}
          </SelectField>
          <SelectField label={t('basics.meatType')} hint={t('basics.meatTypeHint')} error={message('meatTypeId')} value={s.meatTypeId} onChange={(v) => set({ meatTypeId: v }, ['meatTypeId'])}>
            <option value="">{t('none')}</option>
            {meatTypes.map((c) => <option key={c.id} value={c.id}>{name(c.name)}</option>)}
          </SelectField>
        </div>
      </FormSection>

      <FormSection title={t('images.title')} body={t('images.body', { max: MAX_IMAGES })} invalid={invalid('images')}>
        <Gallery images={s.images} upload={upload} error={message('imageMediaIds')} onChange={(images) => set({ images }, ['imageMediaIds'])} />
      </FormSection>

      <FormSection title={t('sizes.title')} body={t('sizes.body')} invalid={invalid('sizes')}>
        {s.sizes.map((r, i) => {
          const patch = (p: Partial<typeof r>, field: string) => set({ sizes: s.sizes.map((x) => (x.key === r.key ? { ...x, ...p } : x)) }, [`sizes.${i}.${field}`]);
          const n = i + 1;
          return (
            <div key={r.key} className="flex items-center gap-s12">
              <SmallInput label={t('sizes.tagAr', { n })} placeholder={t('sizes.tagArPlaceholder')} value={r.tagAr} error={message(`sizes.${i}.tag.ar`)} onChange={(v) => patch({ tagAr: v }, 'tag')} className="w-[150px]" />
              <SmallInput label={t('sizes.tagEn', { n })} placeholder={t('sizes.tagEnPlaceholder')} value={r.tagEn} error={message(`sizes.${i}.tag.en`)} onChange={(v) => patch({ tagEn: v }, 'tag')} className="w-[150px]" dir="ltr" />
              <SmallInput label={t('sizes.grams', { n })} placeholder={t('sizes.gramsPlaceholder')} suffix={t('sizes.gramsUnit')} inputMode="numeric" value={r.grams} error={message(`sizes.${i}.approxWeightGrams`)} onChange={(v) => patch({ grams: v }, 'approxWeightGrams')} className="w-[150px]" />
              <SmallInput label={t('sizes.price', { n })} placeholder="0.00" suffix={t('sar')} inputMode="decimal" value={r.price} error={message(`sizes.${i}.priceHalalas`)} onChange={(v) => patch({ price: v }, 'priceHalalas')} className="w-[170px]" />
              <button type="button" aria-label={t('sizes.remove', { n })} onClick={() => set({ sizes: s.sizes.filter((x) => x.key !== r.key) }, ['sizes'])} className="flex size-9 items-center justify-center text-ink-2">
                <Trash size={20} aria-hidden />
              </button>
            </div>
          );
        })}
        {message('sizes') && <p role="alert" className="text-body-m text-danger">{message('sizes')}</p>}
        <div>
          <Button size="S" variant="secondary" disabled={s.sizes.length >= 20} onClick={() => set({ sizes: [...s.sizes, emptySize()] }, ['sizes'])}>{t('sizes.add')}</Button>
        </div>
      </FormSection>

      <FormSection title={t('cuts.title')} body={t('cuts.body')} invalid={invalid('cuts')}>
        <div className="flex flex-wrap gap-s8" role="group" aria-label={t('cuts.title')}>
          {cuttingStyles.map((c) => {
            const on = s.cuts.some((x) => x.id === c.id);
            return (
              <Chip key={c.id} selected={on} onClick={() => set({ cuts: on ? s.cuts.filter((x) => x.id !== c.id) : [...s.cuts, { id: c.id, price: '' }] }, ['cuttings'])}>
                {name(c.name)}
              </Chip>
            );
          })}
        </div>
        {s.cuts.map((c, i) => (
          <div key={c.id} className="flex items-center gap-s12">
            <span className="w-[150px] text-body-m text-ink">{name(options.cuttingStyles.find((x) => x.id === c.id)?.name)}</span>
            <SmallInput
              label={t('cuts.extra', { name: name(options.cuttingStyles.find((x) => x.id === c.id)?.name) })}
              placeholder={t('free')}
              suffix={t('sar')}
              inputMode="decimal"
              value={c.price}
              error={message(`cuttings.${i}.extraPriceHalalas`) ?? message(`cuttings.${i}.cuttingStyleId`)}
              onChange={(v) => set({ cuts: s.cuts.map((x) => (x.id === c.id ? { ...x, price: v } : x)) }, [`cuttings.${i}`])}
              className="w-[170px]"
            />
          </div>
        ))}
      </FormSection>

      <FormSection title={t('packs.title')} body={t('packs.body')} invalid={invalid('packs')}>
        {PACKAGINGS.map((k) => {
          const i = s.packs.findIndex((x) => x.packaging === k);
          return (
            <div key={k} className="flex items-center gap-s16">
              <Checkbox
                label={t(`packaging.${k}`)}
                checked={i >= 0}
                onChange={(on) => set({ packs: on ? [...s.packs, { packaging: k, price: '' }] : s.packs.filter((x) => x.packaging !== k) }, ['packagings'])}
              />
              {i >= 0 && (
                <SmallInput
                  label={t('packs.extra', { name: t(`packaging.${k}`) })}
                  placeholder={t('free')}
                  suffix={t('sar')}
                  inputMode="decimal"
                  value={s.packs[i]!.price}
                  error={message(`packagings.${i}.extraPriceHalalas`)}
                  onChange={(v) => set({ packs: s.packs.map((x) => (x.packaging === k ? { ...x, price: v } : x)) }, [`packagings.${i}`])}
                  className="w-[170px]"
                />
              )}
            </div>
          );
        })}
      </FormSection>

      <FormSection title={t('exclusions.title')} body={t('exclusions.body')} invalid={invalid('exclusions')}>
        <div className="flex flex-wrap gap-s8" role="group" aria-label={t('exclusions.title')}>
          {exclusionItems.map((x) => {
            const on = s.exclusions.includes(x.id);
            return (
              <Chip key={x.id} selected={on} onClick={() => set({ exclusions: on ? s.exclusions.filter((y) => y !== x.id) : [...s.exclusions, x.id] }, ['exclusionItemIds'])}>
                {name(x.name)}
              </Chip>
            );
          })}
        </div>
      </FormSection>

      <FormSection title={t('matrix.title')} body={t(setRule ? 'matrix.body' : 'matrix.bodyReadOnly', { cuts: cuttingStyles.length, packs: PACKAGINGS.length })} invalid={invalid('matrix')}>
        <Matrix
          cuttingStyles={cuttingStyles}
          rules={rules}
          onRules={(next) => {
            setRules(next);
            setErrors(({ pairs: _, ...rest }) => rest);
          }}
          setRule={setRule}
          offered={(cut, k) => s.cuts.some((x) => x.id === cut) && s.packs.some((x) => x.packaging === k)}
          name={name}
        />
        {message('pairs') && <p role="alert" className="text-body-m text-danger">{message('pairs')}</p>}
      </FormSection>

      <FormSection title={t('fulfilment.title')} body={t('fulfilment.body')} invalid={invalid('fulfilment')}>
        <Switch label={t('fulfilment.delivery')} checked={s.delivery} onChange={(delivery) => set({ delivery }, ['fulfilment'])} />
        <Switch label={t('fulfilment.pickup')} checked={s.pickup} onChange={(pickup) => set({ pickup }, ['fulfilment'])} />
        {message('fulfilment') && <p role="alert" className="text-body-m text-danger">{message('fulfilment')}</p>}
        {/* shortcut: API gap, no order type (slaughtered on order), minimum quantity or preparation time on a product; shown disabled (#69). */}
        <Switch label={t('fulfilment.onOrder')} checked={false} onChange={() => {}} disabled />
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('fulfilment.prep')} hint={t('fulfilment.prepHint')} placeholder={t('placeholder')} disabled />
          <InputField label={t('fulfilment.minQty')} hint={t('fulfilment.minQtyHint')} placeholder={t('placeholder')} disabled />
        </div>
      </FormSection>

      <FormSection title={t('availability.title')} body={t('availability.body')}>
        <Switch label={t('availability.available')} checked={s.available} onChange={(available) => set({ available })} />
        {/* shortcut: API gap, no order days, daily quantity or pause date on a product; shown disabled (#69). */}
        <div className="flex flex-wrap gap-s8">
          {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((d) => <Chip key={d} disabled>{t(`availability.days.${d}`)}</Chip>)}
        </div>
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('availability.daily')} hint={t('availability.dailyHint')} placeholder={t('placeholder')} disabled />
          <InputField label={t('availability.pause')} hint={t('availability.pauseHint')} placeholder={t('placeholder')} disabled />
        </div>
      </FormSection>

      </fieldset>
      {notice}
      {!readOnly && (
        <div className="flex items-center justify-between gap-s12 rounded-md border border-line bg-paper px-s24 py-s16">
          <div className="flex gap-s12">
            {actions.map((a) => (
              <Button key={a.intent} type={a.variant === 'primary' ? 'submit' : 'button'} variant={a.variant} loading={busy === a.intent} disabled={busy !== null && busy !== a.intent} onClick={a.variant === 'primary' ? undefined : () => !busy && void submit(a.intent)}>
                {a.label}
              </Button>
            ))}
          </div>
          {/* shortcut: API gap, products cannot be deleted (no DELETE endpoint); shown disabled (#49). */}
          {deleteLabel && <Button variant="danger" disabled>{deleteLabel}</Button>}
        </div>
      )}
    </form>
  );
}

/** The API's refusal on the form's fields: VALIDATION_FAILED paths, PRODUCT_NOT_SUBMITTABLE reasons, media errors. */
function errorsOf(e: unknown, values: ProductFormValues): Errors | null {
  const f = fieldErrors(e);
  if (f) return f;
  if (!(e instanceof ApiError)) return null;
  if (e.code === 'PRODUCT_NOT_SUBMITTABLE') {
    const reasons = ((e.details as { reasons?: string[] } | undefined)?.reasons ?? []) as string[];
    const out: Errors = {};
    if (reasons.includes('NO_SIZE')) out.sizes = 'NO_SIZE';
    if (reasons.includes('NO_IMAGE')) out.imageMediaIds = 'NO_IMAGE';
    if (reasons.includes('INCOMPATIBLE_CUTTING_PACKAGING')) out.pairs = 'INCOMPATIBLE_CUTTING_PACKAGING';
    return Object.keys(out).length ? out : null;
  }
  if (e.code === 'MEDIA_NOT_FOUND' || e.code === 'MEDIA_NOT_READY') {
    const id = (e.details as { mediaId?: string } | undefined)?.mediaId;
    const i = values.content.imageMediaIds.indexOf(id ?? '');
    return { [i >= 0 ? `imageMediaIds.${i}` : 'imageMediaIds']: 'MEDIA_NOT_READY' };
  }
  return null;
}

function SelectField({ label, hint, error, value, onChange, children }: { label: string; hint: string; error?: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <FormField label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <span className="relative">
          <select id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} value={value} onChange={(e) => onChange(e.target.value)} className={cn(fieldClass(invalid), 'appearance-none pe-[44px]', !value && 'text-muted')}>
            {children}
          </select>
          <CaretDown size={16} aria-hidden className="pointer-events-none absolute end-s16 top-1/2 -translate-y-1/2 text-ink-2" />
        </span>
      )}
    </FormField>
  );
}
