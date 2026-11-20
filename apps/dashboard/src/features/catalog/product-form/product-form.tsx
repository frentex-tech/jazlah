'use client';

import { CaretDown, Check, Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { FormField, InputField, fieldClass } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { ApiError } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { fieldErrors } from '../client';
import { IMAGE_TYPES, MAX_IMAGES, PACKAGINGS, PRODUCT_IMAGE_MAX, type Packaging, type Product, type RefItem, type Rule } from '../types';
import { emptySize, stateOf, toValues, type Errors, type FormState, type ProductFormValues } from './values';

export type { ProductFormValues } from './values';

/** The pickers' entries and the global cutting × packaging rules, loaded by the page (admin or vendor endpoints). */
export type FormOptions = { categories: RefItem[]; meatTypes: RefItem[]; cuttingStyles: RefItem[]; exclusionItems: RefItem[]; rules: Rule[] };

/** A failed submit; `product` is set when part of it was saved (a draft created, then publishing refused). */
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
  setRule?: (cuttingStyleId: string, packaging: Packaging, incompatible: boolean) => Promise<Rule[]>;
  /** The footer's buttons: each submits with its intent (e.g. «draft», «publish»). */
  actions: { intent: string; label: string; variant: 'primary' | 'secondary' }[];
  deleteLabel?: string;
  /** Saves; resolves to the product as saved, or throws (ApiError, SubmitError) for the form to show on its fields. */
  onSubmit: (values: ProductFormValues, intent: string) => Promise<Product>;
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
      <Skeleton className="h-[120px] rounded-md" />
      {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 rounded-md" />)}
    </div>
  );
}

/**
 * The product form shared by the admin (JAZLA products, CAT-DSH-1) and the vendor (CAT-DSH-2): 131:35405 edit,
 * 131:35813 new, 131:36439 validation. It knows no endpoint: the page passes the options, the upload, the rules
 * editor and the submit. Errors from the API (VALIDATION_FAILED paths, PRODUCT_NOT_SUBMITTABLE) land on the fields.
 */
export function ProductForm({ product, options, upload, setRule, actions, deleteLabel, onSubmit }: ProductFormProps) {
  const t = useTranslations('catalog.form');
  const tg = useTranslations();
  const locale = useLocale();
  const [s, setS] = useState<FormState>(() => stateOf(product));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [rules, setRules] = useState(options.rules);
  const [ruleBusy, setRuleBusy] = useState<string | null>(null);
  const name = (n: { ar: string; en: string } | null | undefined) => (n ? (locale === 'en' ? n.en : n.ar) : '');

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
  const incompatible = (cut: string, k: Packaging) => rules.find((r) => r.cuttingStyleId === cut && r.packaging === k);

  async function submit(intent: string) {
    const { values, errors: own } = toValues(s);
    setErrors(own);
    if (Object.keys(own).length) return;
    setBusy(intent);
    try {
      setS(stateOf(await onSubmit(values, intent)));
    } catch (err) {
      const cause = err instanceof SubmitError ? err.cause : err;
      if (err instanceof SubmitError && err.product) setS(stateOf(err.product));
      const mapped = errorsOf(cause, values);
      if (mapped) setErrors(mapped);
      else toast('error', t('saveFailed'));
    } finally {
      setBusy(null);
    }
  }

  async function toggleRule(cut: string, k: Packaging) {
    if (!setRule) return;
    const key = `${cut}|${k}`;
    setRuleBusy(key);
    try {
      setRules(await setRule(cut, k, !incompatible(cut, k)));
      setErrors(({ pairs: _, ...rest }) => rest);
    } catch {
      toast('error', t('matrix.failed'));
    } finally {
      setRuleBusy(null);
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
        if (!busy) void submit(actions.find((a) => a.variant === 'primary')?.intent ?? actions[0]!.intent);
      }}
    >
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
        <div role="table" aria-label={t('matrix.title')} className="flex flex-col gap-s8">
          <div role="row" className="flex h-11 items-center">
            <span role="columnheader" className="w-[172px] shrink-0" />
            {PACKAGINGS.map((k) => (
              <span key={k} role="columnheader" className="flex w-[150px] shrink-0 justify-center text-label-m text-ink">{t(`packaging.${k}`)}</span>
            ))}
          </div>
          {cuttingStyles.map((c, ri) => (
            <div key={c.id} role="row" className={cn('flex h-[52px] items-center rounded-sm', ri % 2 === 1 && 'bg-bg')}>
              <span role="rowheader" className="flex w-[172px] shrink-0 px-s8 text-label-m text-ink">{name(c.name)}</span>
              {PACKAGINGS.map((k) => {
                const bad = !!incompatible(c.id, k);
                // A pair this product offers although a rule forbids it: it blocks publishing (PRODUCT_NOT_SUBMITTABLE).
                const offered = bad && s.cuts.some((x) => x.id === c.id) && s.packs.some((x) => x.packaging === k);
                const label = t('matrix.cell', { cut: name(c.name), packaging: t(`packaging.${k}`), state: t(bad ? 'matrix.incompatible' : 'matrix.compatible') });
                const box = cn(
                  'flex size-11 items-center justify-center rounded-sm',
                  bad ? 'border border-line bg-paper text-ink-2' : 'bg-ember text-paper',
                  offered && 'border-2 border-danger',
                );
                const icon = ruleBusy === `${c.id}|${k}` ? <Spinner className="size-5" /> : bad ? <Minus size={22} aria-hidden /> : <Check size={22} aria-hidden />;
                return (
                  <span key={k} role="cell" className="flex w-[150px] shrink-0 justify-center">
                    {setRule ? (
                      <button type="button" aria-label={label} aria-pressed={!bad} disabled={ruleBusy !== null} onClick={() => void toggleRule(c.id, k)} className={box}>{icon}</button>
                    ) : (
                      <span role="img" aria-label={label} className={box}>{icon}</span>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {message('pairs') && <p role="alert" className="text-body-m text-danger">{message('pairs')}</p>}
        <div className="flex items-center gap-s24 text-body-m text-ink-2">
          <span className="flex items-center gap-s8"><span aria-hidden className="size-5 rounded-sm bg-ember" />{t('matrix.compatible')}</span>
          <span className="flex items-center gap-s8"><span aria-hidden className="size-5 rounded-sm border border-line bg-paper" />{t('matrix.legendIncompatible')}</span>
        </div>
      </FormSection>

      <FormSection title={t('fulfilment.title')} body={t('fulfilment.body')} invalid={invalid('fulfilment')}>
        <Switch label={t('fulfilment.delivery')} checked={s.delivery} onChange={(delivery) => set({ delivery }, ['fulfilment'])} />
        <Switch label={t('fulfilment.pickup')} checked={s.pickup} onChange={(pickup) => set({ pickup }, ['fulfilment'])} />
        {message('fulfilment') && <p role="alert" className="text-body-m text-danger">{message('fulfilment')}</p>}
        {/* shortcut: API gap, no order type (slaughtered on order), minimum quantity or preparation time on a product; shown disabled. */}
        <Switch label={t('fulfilment.onOrder')} checked={false} onChange={() => {}} disabled />
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('fulfilment.prep')} hint={t('fulfilment.prepHint')} placeholder={t('placeholder')} disabled />
          <InputField label={t('fulfilment.minQty')} hint={t('fulfilment.minQtyHint')} placeholder={t('placeholder')} disabled />
        </div>
      </FormSection>

      <FormSection title={t('availability.title')} body={t('availability.body')}>
        <Switch label={t('availability.available')} checked={s.available} onChange={(available) => set({ available })} />
        {/* shortcut: API gap, no order days, daily quantity or pause date on a product; shown disabled. */}
        <div className="flex flex-wrap gap-s8">
          {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((d) => <Chip key={d} disabled>{t(`availability.days.${d}`)}</Chip>)}
        </div>
        <div className="grid grid-cols-2 gap-s24">
          <InputField label={t('availability.daily')} hint={t('availability.dailyHint')} placeholder={t('placeholder')} disabled />
          <InputField label={t('availability.pause')} hint={t('availability.pauseHint')} placeholder={t('placeholder')} disabled />
        </div>
      </FormSection>

      <div className="flex items-center justify-between gap-s12 rounded-md border border-line bg-paper px-s24 py-s16">
        <div className="flex gap-s12">
          {actions.map((a) => (
            <Button key={a.intent} type={a.variant === 'primary' ? 'submit' : 'button'} variant={a.variant} loading={busy === a.intent} disabled={busy !== null && busy !== a.intent} onClick={a.variant === 'primary' ? undefined : () => !busy && void submit(a.intent)}>
              {a.label}
            </Button>
          ))}
        </div>
        {/* shortcut: API gap, products cannot be deleted (no DELETE endpoint); shown disabled. */}
        {deleteLabel && <Button variant="danger" disabled>{deleteLabel}</Button>}
      </div>
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

/**
 * The 44px value boxes of the sizes rows (131:35405); an error shows as the danger border with the message in the box
 * when it is empty (131:36439), and is read out either way.
 */
function SmallInput({
  label, value, onChange, error, suffix, className, placeholder, ...rest
}: { label: string; value: string; onChange: (v: string) => void; error?: string; suffix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <label className={cn('flex h-11 shrink-0 items-center gap-s8 rounded-sm border px-s12', error ? 'border-danger' : 'border-line', 'bg-paper', className)}>
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        placeholder={error && !value ? error : placeholder}
        className={cn('min-w-0 flex-1 bg-transparent text-body-m text-ink outline-none', error && !value ? 'placeholder:text-ink' : 'placeholder:text-muted')}
        {...rest}
      />
      {suffix && <span className="text-body-m text-ink-2">{suffix}</span>}
      {error && <span role="alert" className="sr-only">{`${label}: ${error}`}</span>}
    </label>
  );
}

/**
 * Images (131:35405): the cover, the others, then «add». Drag one onto another to reorder (the first is the cover),
 * or focus it and use the arrow keys; each new file is uploaded at once (ticket, storage, confirm).
 */
function Gallery({ images, upload, error, onChange }: { images: FormState['images']; upload: (f: File) => Promise<string>; error?: string; onChange: (v: FormState['images']) => void }) {
  const t = useTranslations('catalog.form.images');
  const tg = useTranslations();
  const input = useRef<HTMLInputElement>(null);
  const dragged = useRef<number | null>(null);
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState<string>();
  const latest = useRef(images);
  latest.current = images;
  const blobs = useRef<string[]>([]);
  useEffect(() => () => blobs.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    onChange(next);
  };
  async function add(files: File[]) {
    setFailed(undefined);
    const room = MAX_IMAGES - images.length - pending;
    for (const file of files.slice(0, Math.max(0, room))) {
      if (!IMAGE_TYPES.includes(file.type) || file.size > PRODUCT_IMAGE_MAX) {
        setFailed(t('rule'));
        continue;
      }
      setPending((n) => n + 1);
      try {
        const mediaId = await upload(file);
        const url = URL.createObjectURL(file);
        blobs.current.push(url);
        onChange([...latest.current, { mediaId, url }]);
      } catch {
        setFailed(tg('upload.failed'));
      } finally {
        setPending((n) => n - 1);
      }
    }
  }

  const tile = (i: number, img: FormState['images'][number]) => (
    <div
      key={img.mediaId}
      draggable
      onDragStart={() => (dragged.current = i)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => dragged.current !== null && move(dragged.current, i)}
      className={cn('group relative shrink-0 overflow-hidden bg-sand', i === 0 ? 'h-[180px] w-[240px] rounded-md' : 'h-[84px] w-[114px] rounded-sm')}
    >
      <button
        type="button"
        aria-label={t(i === 0 ? 'cover' : 'image', { n: i + 1, count: images.length })}
        onKeyDown={(e) => {
          const rtl = document.documentElement.dir === 'rtl';
          if (e.key === 'ArrowRight') move(i, rtl ? i - 1 : i + 1);
          if (e.key === 'ArrowLeft') move(i, rtl ? i + 1 : i - 1);
        }}
        className="size-full cursor-grab"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a CDN or blob: preview, shown as is */}
        {img.url && <img src={img.url} alt="" className="size-full object-cover" />}
      </button>
      <button type="button" aria-label={t('remove', { n: i + 1 })} onClick={() => onChange(images.filter((x) => x.mediaId !== img.mediaId))} className="absolute end-s4 top-s4 flex size-7 items-center justify-center rounded-pill bg-paper/90 text-ink">
        <X size={14} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-s8">
      <div className="flex flex-wrap gap-s12">
        {images[0] && tile(0, images[0])}
        {images.length > 1 && <div className="grid grid-flow-col grid-rows-2 gap-s12">{images.slice(1).map((img, j) => tile(j + 1, img))}</div>}
        {images.length + pending < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className={cn('flex h-[180px] items-center justify-center gap-s8 rounded-md border bg-bg text-label-m text-ink-2', images.length ? 'w-[240px]' : 'w-full', error || failed ? 'border-danger' : 'border-line')}
          >
            {pending ? <Spinner className="size-6 text-ember" /> : <Plus size={24} aria-hidden />}
            {pending ? tg('upload.uploading') : t('add')}
          </button>
        )}
      </div>
      {(error || failed) && <p role="alert" className="text-body-m text-danger">{error ?? failed}</p>}
      <input
        ref={input}
        type="file"
        hidden
        multiple
        accept={IMAGE_TYPES.join(',')}
        aria-label={t('add')}
        onChange={(e) => {
          void add([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

