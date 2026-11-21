'use client';

import { ArrowsClockwise, DownloadSimple, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackButton } from '@/components/shell/back-button';
import { PageHeader } from '@/components/shell/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputField } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { StateCard } from '@/components/ui/state-card';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { VendorCapacityTab } from '@/features/operations/vendor-capacity';
import { Link } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { bpsOf, percentOf, type Application, type ApplicationDetail, type Review, type Vendor } from './types';
import { dayOf } from '@/lib/date';

const PinMap = dynamic(() => import('@/features/vendor-onboarding/pin-map').then((m) => m.PinMap), { ssr: false });

// Document chips in the order of 131:18512; facility photos go to «store photos».
const DOC_ORDER = ['commercial_registration', 'municipality_licence', 'health_certificate', 'national_id'] as const;
type Doc = ApplicationDetail['documents'][number];
type Dialog = 'approve' | 'reject' | 'suspend' | 'reinstate' | null;
const PRESETS = ['expired', 'unclear', 'mismatch'] as const;
const card = 'flex w-full flex-col gap-s16 rounded-md border border-line bg-paper p-s24';

/**
 * VND-DSH-2: one store under review (131:18512 and its states). The id is a pending application's or a vendor's: an
 * application is approved (commission %) or rejected (reason); a vendor is suspended (reason) or reactivated.
 */
export function VendorReview({ id: routeId }: { id: string }) {
  const t = useTranslations('review');
  const locale = useLocale();
  // The store's current id: the application's until it is approved, then the new vendor's (as the address shows). A ref,
  // so switching it after an approval does not reload the page.
  const idRef = useRef(routeId);
  const [review, setReview] = useState<Review | 'loading' | 'error' | 'denied' | 'notFound'>('loading');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [commission, setCommission] = useState('');
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [tab, setTab] = useState<'details' | 'capacity'>('details');

  const fetchReview = useCallback(async (quiet = false) => {
    if (!quiet) setReview('loading');
    try {
      setReview(await panelFetch<Review>('admin', `/api/admin/vendors/${idRef.current}`));
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK';
      setReview(code === 'NOT_ALLOWED' ? 'denied' : code === 'NOT_FOUND' ? 'notFound' : 'error');
    }
  }, []);
  useEffect(() => {
    idRef.current = routeId;
    void fetchReview();
  }, [routeId, fetchReview]);

  const r = typeof review === 'object' ? review : null;
  const name = r ? (locale === 'en' ? (r.vendor ?? r.application)!.name.en : (r.vendor ?? r.application)!.name.ar) : '';
  const header = (
    <PageHeader
      start
      breadcrumb={r ? t(r.vendor ? 'breadcrumb.vendor' : 'breadcrumb.application', { name }) : t('breadcrumb.loading')}
      title={r ? t('title', { name }) : t('titleLoading')}
    />
  );

  if (review === 'loading') {
    return (
      <>
        {header}
        <div role="status" aria-label={t('titleLoading')} className="flex w-full flex-col gap-s24">
          <Skeleton className="h-[120px]" />
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
        </div>
      </>
    );
  }
  if (!r) {
    const s = review;
    return (
      <>
        {header}
        {s === 'error' && (
          <StateCard kind="error" className="h-[360px]" title={t('error.title')} body={t('error.body')} action={<Button onClick={() => void fetchReview()}>{t('error.action')}</Button>} />
        )}
        {s === 'denied' && <StateCard kind="denied" className="h-[360px]" title={t('denied.title')} body={t('denied.body')} action={<BackButton label={t('denied.action')} panel="admin" />} />}
        {s === 'notFound' && (
          <StateCard
            kind="search"
            className="h-[360px]"
            title={t('notFound.title')}
            body={t('notFound.body')}
            action={<Link href="/admin/vendors" className={buttonVariants({ variant: 'secondary' })}>{t('notFound.action')}</Link>}
          />
        )}
      </>
    );
  }

  const { vendor, application } = r;
  const open = (d: Dialog) => {
    setFieldError(undefined);
    setReason('');
    setCommission('');
    setDialog(d);
  };

  /** One action: the answer replaces what the page shows, a toast says what happened; races reload the store. */
  async function act<T>(url: string, body: object | null, done: (data: T) => void, success: string) {
    setBusy(true);
    try {
      done(await panelFetch<T>('admin', url, { method: 'POST', ...(body && { body: JSON.stringify(body) }) }));
      setDialog(null);
      toast('success', t(`toast.${success}`, { name }));
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK';
      if (code === 'VALIDATION_FAILED') return setFieldError(dialog === 'approve' ? t('approveDialog.invalid') : t('reasonRequired'));
      setDialog(null);
      if (code === 'NOT_ALLOWED') return setReview('denied');
      const known = { VENDOR_APPLICATION_NOT_PENDING: 'notPending', VENDOR_ACCESS_ALREADY_HELD: 'accessHeld', CONFLICT: 'conflict' }[code];
      toast('error', t(`toast.${known ?? 'failed'}`));
      if (code === 'VENDOR_APPLICATION_NOT_PENDING' || code === 'CONFLICT') void fetchReview(true);
    } finally {
      setBusy(false);
    }
  }

  const reasonOk = () => {
    const n = reason.trim().length;
    if (n === 0 || n > 500) {
      setFieldError(t(n === 0 ? 'reasonRequired' : 'reasonTooLong'));
      return false;
    }
    return true;
  };

  function confirm() {
    if (dialog === 'approve' && application) {
      const bps = bpsOf(commission);
      if (bps === null) return setFieldError(t('approveDialog.invalid'));
      void act<Vendor>(`/api/admin/vendor-applications/${application.id}/approve`, { commissionBasisPoints: bps }, (v) => {
        setReview({ vendor: v, application: { ...application, status: 'approved', reviewedAt: v.createdAt } });
        // The store is now a vendor: its own address, without reloading the page.
        window.history.replaceState(null, '', window.location.pathname.replace(application.id, v.id));
        idRef.current = v.id;
      }, 'approved');
    } else if (dialog === 'reject' && application && reasonOk()) {
      void act<Application>(`/api/admin/vendor-applications/${application.id}/reject`, { reason: reason.trim() }, (a) => {
        setReview({ vendor: null, application: { ...application, status: a.status, rejectionReason: a.rejectionReason, reviewedAt: a.reviewedAt } });
      }, 'rejected');
    } else if (dialog === 'suspend' && vendor && reasonOk()) {
      void act<Vendor>(`/api/admin/vendors/${vendor.id}/suspend`, { reason: reason.trim() }, (v) => setReview({ vendor: v, application }), 'suspended');
    } else if (dialog === 'reinstate' && vendor) {
      void act<Vendor>(`/api/admin/vendors/${vendor.id}/reinstate`, null, (v) => setReview({ vendor: v, application }), 'reinstated');
    }
  }

  const docs = application?.documents ?? [];
  const papers = DOC_ORDER.flatMap((k) => docs.filter((d) => d.kind === k));
  const photos = docs.filter((d) => d.kind === 'facility_photo');
  const pending = !vendor && application?.status === 'pending';
  const source = vendor ?? application!;
  const phone = vendor?.contactPhone;

  return (
    <>
      {header}
      {/* SCH-DSH-1: a vendor also has its capacity tab (no frame; built from the DS Tabs). */}
      {vendor && (
        <Tabs
          label={t('tabs.label')}
          value={tab}
          onChange={setTab}
          idPrefix="vendor-tab"
          controls="vendor-tab-panel"
          tabs={[{ key: 'details', label: t('tabs.details') }, { key: 'capacity', label: t('tabs.capacity') }]}
        />
      )}
      {vendor && tab === 'capacity' ? (
        <div id="vendor-tab-panel" role="tabpanel" aria-labelledby="vendor-tab-capacity" className="flex w-full flex-col gap-s24">
          <VendorCapacityTab vendorId={vendor.id} />
        </div>
      ) : (
      <div className="flex w-full items-start gap-s24">
        <div className="flex min-w-0 flex-1 flex-col gap-s24">
          {papers.length > 0 && <DocumentViewer docs={papers} pending={pending} onExpired={() => void fetchReview(true)} />}
          {photos.length > 0 && (
            <section className={card}>
              <h2 className="text-h2 text-ink">{t('photos')}</h2>
              <div className="grid grid-cols-3 gap-s16">
                {photos.map((p) => (
                  <a key={p.mediaId} href={p.url} target="_blank" rel="noopener noreferrer" className="block h-[150px] overflow-hidden rounded-md bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a short-lived presigned URL, shown as is */}
                    <img
                      src={p.url}
                      alt={t('docs.kinds.facility_photo')}
                      onError={() => p.expiresAt && Date.parse(p.expiresAt) < Date.now() && void fetchReview(true)}
                      className="size-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex w-[360px] shrink-0 flex-col gap-s24">
          <section className={card}>
            <h2 className="text-h2 text-ink">{t('summary.title')}</h2>
            <dl className="flex flex-col gap-s12">
              <Row label={t('summary.store')} value={name} />
              <Row label={t('summary.cr')} value={source.commercialRegistrationNumber ?? t('summary.none')} />
              <Row label={t('summary.vat')} value={source.vatNumber ?? t('summary.none')} />
              <Row label={t('summary.holder')} value={source.accountHolderName ?? t('summary.none')} />
              {phone && <Row label={t('summary.phone')} value={<bdi dir="ltr">{phone}</bdi>} />}
              <Row label={t('summary.iban')} value={<bdi dir="ltr">{source.ibanMasked ?? t('summary.none')}</bdi>} />
            </dl>
          </section>

          {source.location && (
            <section className={card}>
              <h2 className="text-h2 text-ink">{t('location')}</h2>
              <div className="h-[150px] overflow-hidden rounded-md bg-sand">
                <PinMap value={source.location} label={t('location')} />
              </div>
              {source.city && <p className="text-body-m text-ink-2">{source.city}</p>}
            </section>
          )}

          <Decision review={r} name={name} onOpen={open} />
        </aside>
      </div>
      )}

      <ConfirmDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && !busy && setDialog(null)}
        title={dialog ? t(`${dialog}Dialog.title`, { name }) : ''}
        body={dialog ? t(`${dialog}Dialog.body`) : ''}
        confirmLabel={dialog ? t(`${dialog}Dialog.confirm`) : undefined}
        destructive={dialog === 'reject' || dialog === 'suspend'}
        loading={busy}
        wide={dialog !== 'reinstate'}
        onConfirm={confirm}
      >
        {dialog === 'approve' && (
          <InputField
            label={t('approveDialog.label')}
            hint={t('approveDialog.hint')}
            error={fieldError}
            inputMode="decimal"
            value={commission}
            onChange={(e) => {
              setCommission(e.target.value);
              setFieldError(undefined);
            }}
            autoFocus
          />
        )}
        {dialog === 'reject' && (
          <div role="group" aria-label={t('rejectDialog.presetsLabel')} className="flex flex-wrap gap-s8">
            {PRESETS.map((p) => (
              <Chip
                key={p}
                selected={reason === t(`rejectDialog.presetText.${p}`)}
                onClick={() => {
                  setReason(t(`rejectDialog.presetText.${p}`));
                  setFieldError(undefined);
                }}
              >
                {t(`rejectDialog.presets.${p}`)}
              </Chip>
            ))}
          </div>
        )}
        {(dialog === 'reject' || dialog === 'suspend') && (
          <InputField
            label={t(`${dialog}Dialog.label`)}
            hint={t(`${dialog}Dialog.hint`)}
            error={fieldError}
            maxLength={500}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setFieldError(undefined);
            }}
            autoFocus={dialog === 'suspend'}
          />
        )}
      </ConfirmDialog>
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

/** The decision card: the checklist and decision of a pending application, or the vendor's state with its action. */
function Decision({ review: { vendor, application }, name, onOpen }: { review: Review; name: string; onOpen: (d: Dialog) => void }) {
  const t = useTranslations('review');
  const locale = useLocale();
  // The checklist helps the reviewer; the API keeps no record of it.
  const [checks, setChecks] = useState({ cr: false, docs: false, location: false });

  if (vendor) {
    const active = vendor.status === 'active';
    return (
      <section className={card} aria-label={name}>
        <h2 className="text-h2 text-ink">{t(active ? 'active.title' : 'suspended.title')}</h2>
        <dl className="flex flex-col gap-s12">
          <Row label={t('active.status')} value={active ? t('active.since', { date: dayOf(vendor.createdAt, locale) }) : t('suspended.since', { date: dayOf(vendor.suspendedAt!, locale) })} />
          <Row label={t('active.commission')} value={`${percentOf(vendor.commissionBasisPoints)}%`} />
          {!active && vendor.suspensionReason && <Row label={t('suspended.reason')} value={vendor.suspensionReason} />}
        </dl>
        {active ? (
          <Button variant="danger" className="w-full" onClick={() => onOpen('suspend')}>{t('active.suspend')}</Button>
        ) : (
          <Button className="w-full" onClick={() => onOpen('reinstate')}>{t('suspended.reinstate')}</Button>
        )}
      </section>
    );
  }
  if (application?.status === 'rejected') {
    return (
      <section className={card}>
        <h2 className="text-h2 text-ink">{t('rejected.title')}</h2>
        <dl className="flex flex-col gap-s12">
          {application.reviewedAt && <Row label={t('active.status')} value={t('rejected.on', { date: dayOf(application.reviewedAt, locale) })} />}
          <Row label={t('rejected.reason')} value={application.rejectionReason} />
        </dl>
      </section>
    );
  }
  if (application?.status !== 'pending') return null;
  return (
    <section className={card}>
      <h2 className="text-h2 text-ink">{t('decision.title')}</h2>
      {(['cr', 'docs', 'location'] as const).map((k) => (
        <Checkbox key={k} label={t(`decision.${k}`)} checked={checks[k]} onChange={(v) => setChecks((c) => ({ ...c, [k]: v }))} />
      ))}
      <Button className="w-full" onClick={() => onOpen('approve')}>{t('decision.approve')}</Button>
      <Button variant="secondary" className="w-full" onClick={() => onOpen('reject')}>{t('decision.reject')}</Button>
    </section>
  );
}

/**
 * Documents viewer (131:18512): one chip per document, the file with zoom and rotate, open/download from its signed link.
 * A file the browser cannot show as an image (a PDF) offers the link instead: the CSP allows no embedded objects.
 */
function DocumentViewer({ docs, pending, onExpired }: { docs: Doc[]; pending: boolean; onExpired: () => void }) {
  const t = useTranslations('review.docs');
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [turn, setTurn] = useState(0);
  const [failed, setFailed] = useState<string>();
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const doc = docs[Math.min(i, docs.length - 1)]!;
  const pick = (n: number) => {
    setI(n);
    setZoom(1);
    setTurn(0);
  };
  const tool = 'flex size-6 items-center justify-center text-ink disabled:text-muted-soft';

  return (
    <section className={card}>
      <h2 className="text-h2 text-ink">{t('title')}</h2>
      <div role="group" aria-label={t('kindsLabel')} className="flex flex-wrap gap-s8">
        {docs.map((d, n) => (
          <Chip key={d.mediaId} selected={n === i} onClick={() => pick(n)}>{t(`kinds.${d.kind}`)}</Chip>
        ))}
      </div>
      <div className="flex h-[380px] items-center justify-center overflow-hidden rounded-md bg-sand">
        {failed === doc.url ? (
          <div className="flex flex-col items-center gap-s12 text-body-m text-ink-2">
            {t('cantShow')}
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary', size: 'S' })}>{t('open')}</a>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- a short-lived presigned URL, shown as is
          <img
            key={doc.url}
            src={doc.url}
            alt={t(`kinds.${doc.kind}`)}
            onError={() => (doc.expiresAt && Date.parse(doc.expiresAt) < Date.now() ? onExpired() : setFailed(doc.url))}
            style={{ transform: `scale(${zoom}) rotate(${turn}deg)` }}
            className="size-full object-cover transition-transform"
          />
        )}
      </div>
      {/* 131:18512: tools on the start side (zoom in first), the document label on the end side. */}
      <div className="flex items-center justify-between gap-s16">
        <div className="flex gap-s16">
          <button type="button" aria-label={t('zoomIn')} className={tool} disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + 0.5))}>
            <MagnifyingGlassPlus size={24} aria-hidden />
          </button>
          <button type="button" aria-label={t('zoomOut')} className={tool} disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>
            <MagnifyingGlassMinus size={24} aria-hidden />
          </button>
          <button type="button" aria-label={t('rotate')} className={tool} onClick={() => setTurn((x) => (x + 90) % 360)}>
            <ArrowsClockwise size={24} aria-hidden />
          </button>
          <a href={doc.url} target="_blank" rel="noopener noreferrer" download aria-label={t('download')} className={tool}>
            <DownloadSimple size={24} aria-hidden />
          </a>
        </div>
        <p className="text-body-m text-ink-2">{t(`kinds.${doc.kind}`)}</p>
      </div>
      <div className="flex w-[400px] max-w-full gap-s12">
        {/* «Matches» is the reviewer's own mark on this page; asking for a new upload has no API (API gap). */}
        <Button
          variant="secondary"
          className="flex-1"
          disabled={!pending || matched.has(doc.mediaId)}
          onClick={() => setMatched((m) => new Set(m).add(doc.mediaId))}
        >
          {matched.has(doc.mediaId) ? t('matched') : t('match')}
        </Button>
        <Button variant="ghost" className="flex-1" disabled>{t('reupload')}</Button>
      </div>
    </section>
  );
}
