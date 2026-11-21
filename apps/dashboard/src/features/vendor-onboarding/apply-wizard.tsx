'use client';

import { Check, Plus } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { uploadWithTicket } from '@/components/ui/file-upload';
import { FormField, InputField, TextInput } from '@/components/ui/form-field';
import { Spinner } from '@/components/ui/spinner';
import { StatePanel } from '@/components/ui/state-panel';
import { useRouter } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { clearDrafts, readDraft, writeDraft } from './drafts';
import type { GeoPoint } from './pin-map';
import {
  DOC_KINDS, DOC_MAX_BYTES, DOC_TYPES, REQUIRED_DOCS, type DocKind, type SubmitApplication, type UploadTicket, type VendorApplication,
} from './types';
import { bankOfIban, formatIban, ibanElectronic, isCrNumber, isSaudiIban, isVatNumber, lengthOk } from './validators';

const PinMap = dynamic(() => import('./pin-map').then((m) => m.PinMap), { ssr: false });

const STEPS = ['business', 'documents', 'bank', 'location', 'review'] as const;
const TYPES = ['butchery', 'slaughterhouse', 'farm'] as const;

type Doc = { mediaId: string; name?: string; size?: number }; // no name: a file of the previous application
type Values = {
  // shortcut: API gap, the business type is not in SubmitVendorApplicationDto; kept on the page only, never sent (#252).
  type: (typeof TYPES)[number];
  nameAr: string;
  nameEn: string;
  cr: string;
  vat: string;
  city: string;
  description: string;
  holder: string;
  iban: string;
  location: GeoPoint | null;
  docs: Partial<Record<DocKind, Doc>>;
  agreed: boolean;
};
type Field = Exclude<keyof Values, 'type' | 'docs'> | DocKind;
type Errors = Partial<Record<Field, string>>; // message keys under `apply`

const blank: Values = {
  type: 'butchery', nameAr: '', nameEn: '', cr: '', vat: '', city: '', description: '', holder: '', iban: '', location: null, docs: {}, agreed: false,
};
const STEP_OF: Record<Field, number> = {
  nameAr: 0, nameEn: 0, cr: 0, vat: 0, city: 0, description: 0,
  commercial_registration: 1, health_certificate: 1, facility_photo: 1, municipality_licence: 1, national_id: 1,
  holder: 2, iban: 2, location: 3, agreed: 4,
};
/** API field (VALIDATION_FAILED details) → form field. */
const FIELD_OF: Record<string, Field> = {
  'name.ar': 'nameAr', 'name.en': 'nameEn', commercialRegistrationNumber: 'cr', vatNumber: 'vat', city: 'city', 'description.ar': 'description',
  accountHolderName: 'holder', iban: 'iban', location: 'location', 'location.latitude': 'location', 'location.longitude': 'location',
};

/** The checks of one step, mirroring SubmitVendorApplicationDto. */
function check(step: number, v: Values): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!lengthOk(v.nameAr, 2, 100)) e.nameAr = v.nameAr.trim() ? 'errors.name' : 'errors.required';
    if (!lengthOk(v.nameEn, 2, 100)) e.nameEn = v.nameEn.trim() ? 'errors.name' : 'errors.required';
    if (!isCrNumber(v.cr)) e.cr = v.cr.trim() ? 'errors.cr' : 'errors.required';
    if (v.vat.trim() && !isVatNumber(v.vat)) e.vat = 'errors.vat';
    if (!lengthOk(v.city, 2, 50)) e.city = v.city.trim() ? 'errors.city' : 'errors.required';
    if (!lengthOk(v.description, 0, 1000)) e.description = 'errors.description';
  }
  if (step === 1) for (const k of REQUIRED_DOCS) if (!v.docs[k]) e[k] = 'documents.missing';
  if (step === 2) {
    if (!lengthOk(v.holder, 2, 100)) e.holder = v.holder.trim() ? 'errors.holder' : 'errors.required';
    if (!isSaudiIban(v.iban)) e.iban = v.iban.trim() ? 'errors.iban' : 'errors.required';
  }
  if (step === 3 && !v.location) e.location = 'location.pinRequired';
  if (step === 4 && !v.agreed) e.agreed = 'review.agreeRequired';
  return e;
}

/** A rejected application as the start of the next one: everything but the IBAN, which the API never returns. */
const fromApplication = (a: VendorApplication): Values => ({
  ...blank,
  nameAr: a.name.ar,
  nameEn: a.name.en,
  cr: a.commercialRegistrationNumber,
  vat: a.vatNumber ?? '',
  city: a.city ?? '',
  description: a.description.ar ?? '',
  holder: a.accountHolderName,
  location: a.location,
  docs: Object.fromEntries(a.documents.map((d) => [d.kind, { mediaId: d.mediaId }])),
});

/**
 * VND-DSH-1: the five steps of the vendor application, with the applicant's customer session. Frames 410:39654 (and
 * 410:40547 at 390), 410:39774 (errors), 410:39867, 410:39936, 410:40011, 410:40094, 410:40179 (sending).
 */
export function ApplyWizard({ phone, owner, reapply }: { phone: string; owner: string; reapply: boolean }) {
  const t = useTranslations('apply');
  const tt = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<'restored' | 'savedLater'>();
  const [submitError, setSubmitError] = useState<string>();
  const [sending, setSending] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const call = useCallback(<T,>(url: string, init?: RequestInit) => panelFetch<T>('customer', url, init), []);

  const load = useCallback(async () => {
    setStatus('loading');
    let latest: VendorApplication | null = null;
    try {
      latest = await call<VendorApplication>('/api/vendor-applications/latest');
    } catch (e) {
      if (!(e instanceof ApiError && e.code === 'NOT_FOUND')) return setStatus('error');
    }
    // A pending or approved application has its status page; a rejected one too, unless the user chose to apply again
    // (a draft never hides the status).
    if (latest && (latest.status !== 'rejected' || !reapply)) return router.replace('/vendor/application');
    const draft = readDraft<Values>(owner);
    if (draft) {
      setV({ ...blank, ...draft.values, iban: '' });
      setStep(draft.step);
      setNotice('restored');
    } else if (latest) setV(fromApplication(latest));
    setStatus('ready');
  }, [call, owner, reapply, router]);
  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (status === 'ready') writeDraft('tab', owner, step, v);
  }, [owner, status, step, v]);

  // After a failed step, focus the first field to fix.
  useEffect(() => {
    if (Object.keys(errors).length) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setV((old) => ({ ...old, [k]: value }));
    setErrors(({ [k as Field]: _, ...rest }) => rest);
  };
  const go = (n: number) => {
    setStep(n);
    setNotice(undefined);
    setSubmitError(undefined);
    top.current?.scrollIntoView();
  };

  function next() {
    const e = check(step, v);
    setErrors(e);
    if (Object.keys(e).length === 0) go(step + 1);
  }

  function showErrors(e: Errors) {
    setErrors(e);
    const first = Math.min(...(Object.keys(e) as Field[]).map((f) => STEP_OF[f]));
    if (Number.isFinite(first)) go(first);
  }

  async function submit() {
    const all: Errors = Object.assign({}, ...STEPS.map((_, i) => check(i, v)));
    if (Object.keys(all).length) return showErrors(all);
    const body: SubmitApplication = {
      name: { ar: v.nameAr.trim(), en: v.nameEn.trim() },
      // shortcut: API gap, the design has one short description; it is sent as the Arabic description (#252).
      ...(v.description.trim() && { description: { ar: v.description.trim() } }),
      commercialRegistrationNumber: v.cr,
      ...(v.vat.trim() && { vatNumber: v.vat }),
      city: v.city.trim(),
      iban: ibanElectronic(v.iban),
      accountHolderName: v.holder.trim(),
      location: v.location!,
      documents: DOC_KINDS.flatMap((kind) => (v.docs[kind] ? [{ kind, mediaId: v.docs[kind].mediaId }] : [])),
    };
    setSending(true);
    setSubmitError(undefined);
    try {
      await call('/api/vendor-applications', { method: 'POST', body: JSON.stringify(body) });
      clearDrafts();
      router.replace('/vendor/application');
    } catch (err) {
      setSending(false);
      const e = err instanceof ApiError ? err : new ApiError('NETWORK');
      if (e.code === 'VENDOR_APPLICATION_ALREADY_PENDING') {
        clearDrafts();
        return router.replace('/vendor/application');
      }
      if (e.code === 'VENDOR_ACCESS_ALREADY_HELD') return setSubmitError(t('errors.alreadyHeld'));
      if ((e.code === 'MEDIA_NOT_FOUND' || e.code === 'MEDIA_NOT_READY') && e.details) {
        const id = (e.details as { mediaId?: string }).mediaId;
        const kind = DOC_KINDS.find((k) => v.docs[k]?.mediaId === id);
        if (kind) {
          setV((old) => ({ ...old, docs: { ...old.docs, [kind]: undefined } }));
          return showErrors({ [kind]: 'documents.expired' });
        }
      }
      if (e.code === 'VALIDATION_FAILED' && Array.isArray(e.details)) {
        const mapped: Errors = {};
        for (const d of e.details as { field?: string }[]) {
          const f = FIELD_OF[d.field ?? ''];
          if (f) mapped[f] = 'errors.' + (f === 'nameAr' || f === 'nameEn' ? 'name' : f === 'location' ? 'location' : f);
          else if (d.field?.startsWith('documents')) Object.assign(mapped, check(1, v));
        }
        if (Object.keys(mapped).length) return showErrors(mapped);
      }
      setSubmitError(e.code === 'RATE_LIMITED' ? t('errors.rateLimited') : t('errors.submit'));
    }
  }

  function saveLater() {
    writeDraft('later', owner, step, v);
    setNotice('savedLater');
  }

  if (status !== 'ready') {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[20px] border border-line bg-paper p-s32">
        {status === 'loading' ? (
          <span role="status" aria-label={t('loading')} className="text-ember">
            <Spinner className="size-8" />
          </span>
        ) : (
          <StatePanel kind="error" title={tt('state.error.title')} body={tt('state.error.body')} action={<Button onClick={() => void load()}>{tt('state.error.action')}</Button>} />
        )}
      </div>
    );
  }

  const err = (f: Field) => (errors[f] ? t(errors[f]) : undefined);
  const errorCount = Object.keys(errors).length;
  const bank = bankOfIban(v.iban);
  const name = t(`steps.${STEPS[step]}`);

  return (
    <>
      <div ref={top} className="scroll-mt-s24">
        <ol aria-label={t('stepsLabel')} className="flex items-center justify-between max-md:hidden">
          {STEPS.map((s, i) => (
            <li key={s} className="contents">
              {i > 0 && <span aria-hidden className={cn('h-0.5 w-7', i <= step ? 'bg-success' : 'bg-line')} />}
              <span aria-current={i === step ? 'step' : undefined} className="flex items-center gap-s8">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-pill text-[13px] font-bold',
                    i < step ? 'bg-success text-paper' : i === step ? 'bg-brand-2 text-paper' : 'bg-sand text-muted',
                  )}
                >
                  {i < step ? <Check size={14} weight="bold" aria-hidden /> : i + 1}
                </span>
                <span className={cn('text-[13px]', i === step ? 'font-bold text-ink' : i < step ? 'text-ink-2' : 'text-muted')}>
                  {i < step ? <><span aria-hidden>{t(`steps.${s}`)}</span><span className="sr-only">{t('stepDone', { name: t(`steps.${s}`) })}</span></> : t(`steps.${s}`)}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-s24 md:hidden">
          <p className="text-[13px] font-medium text-ink-2">{t('stepOf', { n: step + 1, name })}</p>
          <div className="h-1.5 w-full rounded-pill bg-sand" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} aria-label={t('stepsLabel')}>
            <div className="h-full rounded-pill bg-brand-2" style={{ width: `${((step + 1) / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      <form
        noValidate
        className="flex flex-col gap-s24"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) next();
          else if (!sending) void submit();
        }}
      >
        <section className="flex flex-col gap-s20 rounded-[20px] border border-line bg-paper p-s32 max-md:p-s20">
          <div className="flex flex-col gap-[6px]">
            <h1 className="text-h1 text-ink">{t(`${STEPS[step]}.title`)}</h1>
            <p className="text-[15px] leading-6 text-ink-2">{t(`${STEPS[step]}.body`)}</p>
          </div>
          {notice && !errorCount && (
            <p role="status" className="rounded-sm bg-info-bg px-s16 py-s12 text-[14px] font-medium text-info">
              {t(notice)}
            </p>
          )}
          {(errorCount > 0 || submitError) && (
            <p role="alert" className="rounded-sm bg-danger-bg px-s16 py-s12 text-[14px] font-medium text-danger">
              {submitError ?? t('fix', { count: errorCount })}
            </p>
          )}

          {step === 0 && (
            <>
              <div className="flex flex-col gap-[10px]">
                <span id="type-label" className="text-[14px] font-medium text-ink">{t('business.type')}</span>
                <div role="radiogroup" aria-labelledby="type-label" className="flex gap-[10px]">
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      role="radio"
                      aria-checked={v.type === type}
                      onClick={() => set('type', type)}
                      className={cn(
                        'h-10 rounded-pill border px-s20 text-[14px] font-medium',
                        v.type === type ? 'border-brand-2 bg-brand-2 text-paper' : 'border-line bg-paper text-ink-2',
                      )}
                    >
                      {t(`business.types.${type}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-s20 max-md:grid-cols-1">
                <InputField label={t('business.nameAr')} hint={t('business.nameArHint')} value={v.nameAr} onChange={(e) => set('nameAr', e.target.value)} error={err('nameAr')} />
                <InputField label={t('business.nameEn')} hint={t('business.nameEnHint')} value={v.nameEn} onChange={(e) => set('nameEn', e.target.value)} error={err('nameEn')} />
                <InputField label={t('business.cr')} hint={t('business.crHint')} inputMode="numeric" value={v.cr} onChange={(e) => set('cr', e.target.value)} error={err('cr')} />
                <InputField label={t('business.vat')} hint={t('business.vatHint')} placeholder="3XXXXXXXXXXXXX3" inputMode="numeric" value={v.vat} onChange={(e) => set('vat', e.target.value)} error={err('vat')} />
                <InputField label={t('business.city')} hint={t('business.cityHint')} value={v.city} onChange={(e) => set('city', e.target.value)} error={err('city')} />
                {/* shortcut: API gap, no email in SubmitVendorApplicationDto; shown disabled until the API takes it (#252). */}
                <InputField label={t('business.email')} hint={t('business.emailHint')} type="email" dir="ltr" className="rtl:text-end" disabled />
                <FormField label={t('business.phone')} hint={t('business.phoneHint')}>
                  {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={phone} disabled dir="ltr" className="rtl:text-end" />}
                </FormField>
                <InputField
                  label={t('business.description')}
                  hint={t('business.descriptionHint')}
                  placeholder={t('business.descriptionPlaceholder')}
                  value={v.description}
                  onChange={(e) => set('description', e.target.value)}
                  error={err('description')}
                />
              </div>
            </>
          )}

          {step === 1 &&
            DOC_KINDS.map((kind) => (
              <DocRow
                key={kind}
                kind={kind}
                doc={v.docs[kind]}
                error={err(kind)}
                call={call}
                onChange={(doc) => {
                  // Functional: two uploads may finish at once.
                  setV((old) => ({ ...old, docs: { ...old.docs, [kind]: doc } }));
                  setErrors(({ [kind]: _, ...rest }) => rest);
                }}
              />
            ))}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-s20 max-md:grid-cols-1">
                <FormField label={t('bank.bank')} hint={t('bank.bankHint')}>
                  {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={bank ? bank[locale === 'en' ? 'en' : 'ar'] : ''} disabled />}
                </FormField>
                <InputField label={t('bank.holder')} hint={t('bank.holderHint')} value={v.holder} onChange={(e) => set('holder', e.target.value)} error={err('holder')} />
              </div>
              <InputField
                label={t('bank.iban')}
                hint={t('bank.ibanHint')}
                placeholder="SA00 0000 0000 0000 0000 0000"
                autoComplete="off"
                spellCheck={false}
                dir="ltr"
                className="rtl:text-end"
                value={formatIban(v.iban)}
                onChange={(e) => set('iban', ibanElectronic(e.target.value).slice(0, 24))}
                error={err('iban')}
              />
              <p className="rounded-sm bg-info-bg px-s16 py-s12 text-[13px] leading-5 text-info">{t('bank.note')}</p>
            </>
          )}

          {step === 3 && (
            <>
              <div className={cn('relative h-[300px] overflow-hidden rounded-[16px] bg-sand', errors.location && 'ring-2 ring-danger')}>
                <PinMap value={v.location} onChange={(p) => set('location', p)} label={t('location.mapLabel')} />
                <span className="pointer-events-none absolute inset-x-0 top-s16 mx-auto w-fit rounded-pill bg-paper px-s12 py-[6px] text-[12px] font-medium text-ink shadow-card">
                  {t('location.drag')}
                </span>
              </div>
              {errors.location && <p role="alert" className="text-body-m text-danger">{t(errors.location)}</p>}
              <div className="grid grid-cols-2 gap-s20 max-md:grid-cols-1">
                <InputField label={t('business.city')} value={v.city} disabled />
                {/* shortcut: API gap, the district and the address details are not in SubmitVendorApplicationDto (#43). */}
                <InputField label={t('location.district')} disabled />
              </div>
              <InputField label={t('location.address')} hint={t('location.addressHint')} disabled />
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex gap-[18px] max-md:flex-col">
                {/* shortcut: API gap, the application takes no logo or cover; the vendor adds them in the store profile (#43). */}
                {(['logo', 'cover'] as const).map((k) => (
                  <div key={k} className={cn('flex flex-col gap-s8', k === 'logo' ? 'w-[236px] max-md:w-full' : 'flex-1')}>
                    <span className="text-[14px] font-medium text-ink">{t(`review.${k}`)}</span>
                    <button type="button" disabled className="flex h-[150px] items-center justify-center gap-s8 rounded-md border border-line bg-bg text-label-m text-muted-soft">
                      <Plus size={24} aria-hidden />
                      {t('review.addPhoto')}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col rounded-[14px] bg-bg px-s20 py-s12">
                <p className="text-[13px] font-medium text-ink-2">{t('review.summary')}</p>
                <dl>
                  {[
                    [t('review.store'), `${v.nameAr} · ${t(`business.types.${v.type}`)}`],
                    [t('review.cr'), v.cr],
                    [
                      t('review.docs'),
                      t('review.docsValue', {
                        required: REQUIRED_DOCS.filter((k) => v.docs[k]).length,
                        optional: DOC_KINDS.filter((k) => !REQUIRED_DOCS.includes(k) && v.docs[k]).length,
                      }),
                    ],
                    [t('review.bank'), [bank?.[locale === 'en' ? 'en' : 'ar'], ltr(`SA•• •••• ${ibanElectronic(v.iban).slice(-4)}`)].filter(Boolean).join(' · ')],
                    [t('review.location'), v.city],
                  ].map(([k, val]) => (
                    <Row key={k} label={k!} value={val!} />
                  ))}
                </dl>
              </div>
              <div className="flex flex-col gap-s8">
                <Checkbox
                  label={t('review.agree')}
                  checked={v.agreed}
                  onChange={(c) => set('agreed', c)}
                  invalid={!!errors.agreed}
                  describedBy={errors.agreed ? 'agree-error' : undefined}
                />
                {errors.agreed && <p id="agree-error" className="text-body-m text-danger">{t(errors.agreed)}</p>}
              </div>
            </>
          )}
        </section>

        <div className="flex items-center justify-between max-md:flex-col-reverse max-md:gap-s16">
          {step === 0 ? (
            <button type="button" onClick={saveLater} className="text-[14px] font-medium text-ember hover:underline">
              {t('saveLater')}
            </button>
          ) : (
            // Keeps its look while sending (410:40179); the click is ignored then.
            <Button variant="secondary" onClick={() => !sending && go(step - 1)} aria-disabled={sending || undefined}>
              {t('back')}
            </Button>
          )}
          <Button type="submit" loading={sending} className="max-md:w-full">
            {step < 4 ? t('next') : t('submit')}
          </Button>
        </div>
      </form>
    </>
  );
}

/** A left-to-right fragment (masked IBAN, phone) inside right-to-left text: LRI … PDI keeps its order. */
export const ltr = (s: string) => `\u2066${s}\u2069`;

/** One line of a summary: label on the start side, value on the end side (410:40094 «kv»). */
export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-s16 py-s8 text-[14px]">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">
        <bdi>{value}</bdi>
      </dd>
    </div>
  );
}

/** One document of the documents step (410:39867): tag, then upload, or the file with replace and remove. */
function DocRow({
  kind,
  doc,
  error,
  call,
  onChange,
}: {
  kind: DocKind;
  doc?: Doc;
  error?: string;
  call: <T>(url: string, init?: RequestInit) => Promise<T>;
  onChange: (doc: Doc | undefined) => void;
}) {
  const t = useTranslations('apply.documents');
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string>();
  const required = REQUIRED_DOCS.includes(kind);
  const note = failed ?? error;

  async function upload(file: File) {
    setFailed(undefined);
    if (!DOC_TYPES.includes(file.type)) return setFailed(t('wrongType'));
    if (file.size > DOC_MAX_BYTES) return setFailed(t('tooLarge'));
    setBusy(true);
    try {
      const ticket = await call<UploadTicket>('/api/customer/media/uploads', { method: 'POST', body: JSON.stringify({ contentType: file.type, fileName: file.name.slice(0, 255) }) });
      await uploadWithTicket(file, ticket);
      await call(`/api/customer/media/${ticket.mediaId}/confirm`, { method: 'POST' });
      onChange({ mediaId: ticket.mediaId, name: file.name, size: file.size });
    } catch {
      setFailed(t('failed'));
    } finally {
      setBusy(false);
    }
  }

  const label = t(`kinds.${kind}`);
  const size = (bytes: number) =>
    bytes < 1024 * 1024 ? t('kb', { size: Math.max(1, Math.round(bytes / 1024)) }) : t('mb', { size: (bytes / 1024 / 1024).toFixed(1) });
  return (
    <div className={cn('flex items-center justify-between gap-s16 rounded-[14px] border px-s20 py-s16', note ? 'border-danger bg-danger-bg' : doc ? 'border-line bg-bg' : 'border-line')}>
      <div className="flex min-w-0 flex-col gap-s4">
        <span className="flex items-center gap-s8">
          <span className="text-[15px] font-medium text-ink">{label}</span>
          <span className={cn('rounded-pill px-s8 py-[2px] text-[11px] font-medium', required ? 'bg-warning-bg text-warning' : 'bg-sand text-muted')}>
            {t(required ? 'required' : 'optional')}
          </span>
        </span>
        <span role={note ? 'alert' : undefined} className={cn('truncate text-[13px]', note ? 'text-danger' : doc ? 'text-success' : 'text-muted')}>
          {note ?? (doc ? <>✓ <bdi>{doc.name ? t('file', { name: doc.name, size: size(doc.size ?? 0) }) : t('previous')}</bdi></> : t('hint'))}
        </span>
      </div>
      {doc && !busy ? (
        <span className="flex shrink-0 items-center gap-[14px] text-[13px] font-medium">
          <button type="button" className="text-ember hover:underline" aria-label={`${t('replace')}: ${label}`} onClick={() => input.current?.click()}>
            {t('replace')}
          </button>
          <button type="button" className="text-danger hover:underline" aria-label={`${t('remove')}: ${label}`} onClick={() => onChange(undefined)}>
            {t('remove')}
          </button>
        </span>
      ) : (
        <Button variant="secondary" size="S" loading={busy} aria-label={`${t('upload')}: ${label}`} onClick={() => input.current?.click()}>
          {t('upload')}
        </Button>
      )}
      <input
        ref={input}
        type="file"
        hidden
        accept={DOC_TYPES.join(',')}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
