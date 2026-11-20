'use client';

import { LockSimple, Plus } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadWithTicket } from '@/components/ui/file-upload';
import { FormField, InputField, TextInput } from '@/components/ui/form-field';
import { PhoneInput } from '@/components/ui/phone-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { StatePanel } from '@/components/ui/state-panel';
import { Switch } from '@/components/ui/switch';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { nationalDigits } from '@/lib/phone';
import { cn } from '@/lib/utils';
import { IMAGE_MAX_BYTES, IMAGE_TYPES, type UpdateProfile, type UploadTicket, type VendorProfile } from './types';
import { compactDigits, isEmail, isSaudiContactPhone, isVatNumber, lengthOk } from './validators';

const PinMap = dynamic(() => import('./pin-map').then((m) => m.PinMap), { ssr: false });

type Values = { descAr: string; descEn: string; phone: string; email: string; vat: string };
type Field = keyof Values | 'logo' | 'cover';
type Image = { mediaId: string; preview: string };
const valuesOf = (p: VendorProfile): Values => ({
  descAr: p.description.ar ?? '',
  descEn: p.description.en ?? '',
  phone: p.contactPhone ? nationalDigits(p.contactPhone) : '',
  email: p.contactEmail ?? '',
  vat: p.vatNumber ?? '',
});
/** API field (VALIDATION_FAILED details) → form field. */
const FIELD_OF: Record<string, Field> = {
  'description.ar': 'descAr', 'description.en': 'descEn', contactPhone: 'phone', contactEmail: 'email', vatNumber: 'vat', logoMediaId: 'logo', coverMediaId: 'cover',
};

/**
 * VND-DSH-1: the vendor's store profile (GET/PATCH /v1/vendor/profile). Frames 131:24074 (default), 131:24223 (empty),
 * 131:24427 (validation), 131:24631 (loading), 131:24717 (error), 131:24863 (store suspended: read-only).
 */
export function StoreProfile() {
  const t = useTranslations('store');
  const tg = useTranslations();
  const locale = useLocale();
  const [profile, setProfile] = useState<VendorProfile | 'loading' | 'error'>('loading');
  const [v, setV] = useState<Values>({ descAr: '', descEn: '', phone: '', email: '', vat: '' });
  const [images, setImageState] = useState<{ logo?: Image; cover?: Image }>({});
  // New logo and cover previews are object URLs: each is revoked once replaced, dropped or the page left.
  const shown = useRef(images);
  const setImages = useCallback((next: { logo?: Image; cover?: Image }) => {
    for (const k of ['logo', 'cover'] as const) {
      const old = shown.current[k]?.preview;
      if (old && old !== next[k]?.preview) URL.revokeObjectURL(old);
    }
    shown.current = next;
    setImageState(next);
  }, []);
  useEffect(() => () => Object.values(shown.current).forEach((img) => img && URL.revokeObjectURL(img.preview)), []);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState<'saved' | 'failed'>();
  const [saving, setSaving] = useState(false);
  const [suspended, setSuspended] = useState(false);

  // A store suspended mid-session (131:24863) stays on the page, read-only; the server has already ended the session.
  const call = useCallback(<T,>(url: string, init?: RequestInit) => panelFetch<T>('vendor', url, { ...init, stayOn: ['VENDOR_SUSPENDED'] }), []);

  const reset = useCallback((p: VendorProfile) => {
    setProfile(p);
    setV(valuesOf(p));
    setImages({});
    setErrors({});
  }, [setImages]);
  const load = useCallback(async () => {
    setProfile('loading');
    try {
      reset(await panelFetch<VendorProfile>('vendor', '/api/vendor/profile'));
    } catch {
      setProfile('error');
    }
  }, [reset]);
  useEffect(() => void load(), [load]);

  if (profile === 'loading') {
    return (
      <div role="status" aria-label={t('title')} className="flex w-full flex-col gap-s24">
        <Skeleton className="h-[120px] rounded-md" />
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-md" />)}
      </div>
    );
  }
  if (profile === 'error') {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-md border border-line bg-paper">
        <StatePanel kind="error" title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void load()}>{t('error.retry')}</Button>} />
      </div>
    );
  }

  const set = (k: keyof Values, value: string) => {
    setV((old) => ({ ...old, [k]: value }));
    setErrors(({ [k]: _, ...rest }) => rest);
    setNotice(undefined);
  };

  async function save() {
    if (profile === 'loading' || profile === 'error') return;
    const e: Partial<Record<Field, string>> = {};
    if (!lengthOk(v.descAr, 0, 1000)) e.descAr = 'tooLong';
    if (!lengthOk(v.descEn, 0, 1000)) e.descEn = 'tooLong';
    if (v.phone && !isSaudiContactPhone(v.phone)) e.phone = 'contact.phoneInvalid';
    if (v.email.trim() && !isEmail(v.email)) e.email = 'contact.emailInvalid';
    if (v.vat.trim() && !isVatNumber(v.vat)) e.vat = 'contact.vatHint';
    setErrors(e);
    if (Object.keys(e).length) return;

    // PATCH sends only what changed; a cleared field is null, a cleared description language null too.
    const old = valuesOf(profile);
    const desc = {
      ...(v.descAr !== old.descAr && { ar: v.descAr.trim() || null }),
      ...(v.descEn !== old.descEn && { en: v.descEn.trim() || null }),
    };
    const body: UpdateProfile = {
      ...(images.logo && { logoMediaId: images.logo.mediaId }),
      ...(images.cover && { coverMediaId: images.cover.mediaId }),
      ...(Object.keys(desc).length && { description: desc }),
      ...(v.phone !== old.phone && { contactPhone: v.phone ? `+966${v.phone}` : null }),
      ...(v.email !== old.email && { contactEmail: v.email.trim() || null }),
      ...(v.vat !== old.vat && { vatNumber: v.vat.trim() ? compactDigits(v.vat) : null }),
    };
    if (Object.keys(body).length === 0) return setNotice('saved');
    setSaving(true);
    setNotice(undefined);
    try {
      reset(await call<VendorProfile>('/api/vendor/profile', { method: 'PATCH', body: JSON.stringify(body) }));
      setNotice('saved');
    } catch (err) {
      const x = err instanceof ApiError ? err : new ApiError('NETWORK');
      if (x.code === 'VENDOR_SUSPENDED') return setSuspended(true);
      if ((x.code === 'MEDIA_NOT_FOUND' || x.code === 'MEDIA_NOT_READY') && x.details) {
        const id = (x.details as { mediaId?: string }).mediaId;
        const k = images.logo?.mediaId === id ? 'logo' : images.cover?.mediaId === id ? 'cover' : undefined;
        if (k) {
          setImages({ ...images, [k]: undefined });
          return setErrors({ [k]: 'uploadFailed' });
        }
      }
      if (x.code === 'VALIDATION_FAILED' && Array.isArray(x.details)) {
        const mapped: Partial<Record<Field, string>> = {};
        for (const d of x.details as { field?: string }[]) {
          const f = FIELD_OF[d.field ?? ''];
          if (f) mapped[f] = f === 'phone' ? 'contact.phoneInvalid' : f === 'email' ? 'contact.emailInvalid' : f === 'vat' ? 'contact.vatHint' : 'invalid';
        }
        if (Object.keys(mapped).length) return setErrors(mapped);
      }
      setNotice('failed');
    } finally {
      setSaving(false);
    }
  }

  // Keys under `store`, except the shared ones.
  const message = (key: string) => (key === 'tooLong' || key === 'invalid' ? tg(`form.${key}`) : key === 'uploadFailed' ? tg('upload.failed') : t(key));
  const err = (f: Field) => (errors[f] ? message(errors[f]) : undefined);
  const name = locale === 'en' ? profile.name.en : profile.name.ar;
  const contactInvalid = !!(errors.phone || errors.email || errors.vat);

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-s24"
      onSubmit={(e) => {
        e.preventDefault();
        if (!saving) void save();
      }}
    >
      {suspended && (
        <p role="alert" className="flex items-center gap-s12 rounded-md bg-warning-bg px-s16 py-s12 text-body-m text-ink">
          <LockSimple size={24} aria-hidden className="shrink-0" />
          {t('suspended')}
        </p>
      )}
      <fieldset disabled={suspended} className="contents">
        <Section title={t('identity.title')} body={t('identity.body')} invalid={!!(errors.logo || errors.cover)}>
          <div className="flex gap-s16">
            {(['logo', 'cover'] as const).map((k) => (
              <ImageSlot
                key={k}
                kind={k}
                label={t(`identity.${k}`)}
                url={images[k]?.preview ?? profile[k === 'logo' ? 'logoUrl' : 'coverUrl']}
                error={err(k)}
                call={call}
                onSuspended={() => setSuspended(true)}
                onUploaded={(img) => {
                  setImages({ ...shown.current, [k]: img });
                  setErrors(({ [k]: _, ...rest }) => rest);
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-s24">
            <FormField label={t('identity.name')} hint={t('identity.nameHint')}>
              {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={name} disabled />}
            </FormField>
            {/* shortcut: API gap, the store has no tagline in VendorProfileResponseDto; shown disabled. */}
            <InputField label={t('identity.tagline')} hint={t('identity.taglineHint')} placeholder={t('placeholder')} disabled />
          </div>
          <InputField label={t('identity.description')} hint={t('identity.descriptionHint')} placeholder={t('placeholder')} value={v.descAr} onChange={(e) => set('descAr', e.target.value)} error={err('descAr')} />
          <InputField label={t('identity.descriptionEn')} hint={t('identity.descriptionHint')} placeholder={t('placeholder')} value={v.descEn} onChange={(e) => set('descEn', e.target.value)} error={err('descEn')} />
        </Section>

        <Section title={t('contact.title')} body={t('contact.body')} invalid={contactInvalid}>
          <div className="grid grid-cols-2 gap-s24">
            <PhoneInput label={t('contact.phone')} hint={t('contact.phoneHint')} placeholder="5X XXX XXXX" value={v.phone} onChange={(d) => set('phone', d)} error={err('phone')} disabled={suspended} />
            <InputField label={t('contact.email')} hint={t('contact.emailHint')} type="email" placeholder={t('placeholder')} value={v.email} onChange={(e) => set('email', e.target.value)} error={err('email')} />
            <InputField label={t('contact.vat')} hint={t('contact.vatHint')} placeholder="3XXXXXXXXXXXXX3" inputMode="numeric" value={v.vat} onChange={(e) => set('vat', e.target.value)} error={err('vat')} />
          </div>
        </Section>

        <Section title={t('location.title')} body={t('location.body')}>
          <div className="relative h-[200px] overflow-hidden rounded-md bg-sand">
            {profile.location && <PinMap value={profile.location} label={t('location.mapLabel')} />}
          </div>
          {/* shortcut: API gap, the profile has the city only (an admin sets it), no street address. */}
          <FormField label={t('location.address')} hint={t('location.addressHint')}>
            {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={profile.city ?? ''} placeholder={t('placeholder')} disabled />}
          </FormField>
        </Section>

        {/* shortcut: API gap, no working hours in the vendor profile; the switches are shown disabled. */}
        <Section title={t('hours.title')} body={t('hours.body')}>
          {(['weekdays', 'friday', 'holidays'] as const).map((k) => (
            <Switch key={k} label={t(`hours.${k}`)} checked={false} onChange={() => {}} disabled />
          ))}
        </Section>

        <Section title={t('bank.title')} body={t('bank.body')}>
          <FormField label={t('bank.iban')} hint={t('bank.ibanHint')}>
            {({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} value={profile.ibanMasked ?? ''} dir="ltr" className="rtl:text-end" disabled />}
          </FormField>
        </Section>

        {notice && (
          <p role={notice === 'failed' ? 'alert' : 'status'} className={cn('rounded-sm px-s16 py-s12 text-body-m', notice === 'failed' ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success-text')}>
            {notice === 'failed' ? t('error.body') : t('saved')}
          </p>
        )}
        <div className="flex justify-end gap-s12 rounded-md border border-line bg-paper px-s24 py-s16">
          <Button type="submit" loading={saving} disabled={suspended}>
            {t('save')}
          </Button>
          <Button variant="secondary" disabled={suspended || saving} onClick={() => reset(profile)}>
            {t('discard')}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

/** «form-section» of 131:24074: title and body in a 280px column on the start side, the fields beside them. */
function Section({ title, body, invalid, children }: { title: string; body: string; invalid?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn('flex w-full gap-s32 rounded-md border bg-paper p-s24', invalid ? 'border-danger' : 'border-line')}>
      <div className="flex w-[280px] shrink-0 flex-col gap-s8">
        <h2 className="text-h2 text-ink">{title}</h2>
        <p className="text-body-m text-ink-2">{body}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-s20">{children}</div>
    </section>
  );
}

/** Logo (96, round) or cover (660 × 96, r18): the picture, or a placeholder; a click uploads a new one (vendor.logo / vendor.cover). */
function ImageSlot({
  kind,
  label,
  url,
  error,
  call,
  onSuspended,
  onUploaded,
}: {
  kind: 'logo' | 'cover';
  label: string;
  url: string | null;
  error?: string;
  call: <T>(url: string, init?: RequestInit) => Promise<T>;
  onSuspended: () => void;
  onUploaded: (img: Image) => void;
}) {
  const t = useTranslations('store.identity');
  const tu = useTranslations('upload');
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setFailed] = useState<string>();
  const failed = localError ?? error;

  async function upload(file: File) {
    setFailed(undefined);
    if (!IMAGE_TYPES.includes(file.type)) return setFailed(t('imageType'));
    if (file.size > IMAGE_MAX_BYTES) return setFailed(t('imageTooLarge'));
    setBusy(true);
    try {
      const ticket = await call<UploadTicket>('/api/vendor/media/uploads', {
        method: 'POST',
        body: JSON.stringify({ purpose: `vendor.${kind}`, contentType: file.type, fileName: file.name.slice(0, 255) }),
      });
      await uploadWithTicket(file, ticket);
      await call(`/api/vendor/media/${ticket.mediaId}/confirm`, { method: 'POST' });
      onUploaded({ mediaId: ticket.mediaId, preview: URL.createObjectURL(file) });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'VENDOR_SUSPENDED') onSuspended();
      else setFailed(tu('failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-s8', kind === 'cover' && 'min-w-0 flex-1')}>
      <button
        type="button"
        aria-label={t('change', { name: label })}
        onClick={() => input.current?.click()}
        className={cn(
          'relative flex h-24 items-center justify-center overflow-hidden border border-line bg-bg text-ink-2 disabled:cursor-default',
          kind === 'logo' ? 'w-24 shrink-0 rounded-pill' : 'w-full rounded-md',
          failed && 'border-danger',
        )}
      >
        {url ? (
          // A remote CDN or blob: preview, shown as is: next/image would need every CDN host configured.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <Plus size={24} aria-hidden />
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-paper/70 text-ember">
            <Spinner className="size-6" />
          </span>
        )}
      </button>
      {failed && <p role="alert" className="text-body-m text-danger">{failed}</p>}
      <input
        ref={input}
        type="file"
        hidden
        accept={IMAGE_TYPES.join(',')}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
