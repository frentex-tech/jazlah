'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { StatePanel } from '@/components/ui/state-panel';
import { Link, useRouter } from '@/i18n/navigation';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import { cn } from '@/lib/utils';
import { Row, ltr } from './apply-wizard';
import type { VendorApplication } from './types';

const BADGE = { pending: 'bg-warning-bg text-warning', approved: 'bg-success-bg text-success', rejected: 'bg-danger-bg text-danger' } as const;
const card = 'flex flex-col gap-s20 rounded-[20px] border border-line bg-paper p-s32 max-md:p-s20';

/**
 * VND-DSH-1: where the applicant's latest application is. Frames 410:40216 (pending, 410:40644 at 390), 410:40259
 * (approved: sign in to the vendor panel as staff), 410:40298 (rejected: the reason, and apply again).
 */
export function ApplicationStatus({ phone }: { phone: string }) {
  const t = useTranslations('application');
  const tt = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [app, setApp] = useState<VendorApplication | 'loading' | 'error'>('loading');
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setApp('loading');
    try {
      setApp(await panelFetch<VendorApplication>('customer', '/api/vendor-applications/latest'));
    } catch (e) {
      if (e instanceof ApiError && e.code === 'NOT_FOUND') return router.replace('/vendor/apply'); // never applied
      setApp('error');
    }
  }, [router]);
  useEffect(() => void load(), [load]);

  if (app === 'loading' || app === 'error') {
    return (
      <div className={cn(card, 'min-h-[320px] items-center justify-center')}>
        {app === 'loading' ? (
          <span role="status" aria-label={tt('state.loading')} className="text-ember">
            <Spinner className="size-8" />
          </span>
        ) : (
          <StatePanel kind="error" title={tt('state.error.title')} body={tt('state.error.body')} action={<Button onClick={() => void load()}>{tt('state.error.action')}</Button>} />
        )}
      </div>
    );
  }

  // Gregorian calendar and Latin digits in Arabic too, Riyadh time, as in the frames: «18 نوفمبر، 10:24 ص».
  // Day and time formatted apart and joined with a comma: Intl's own joiner is «في» / "at".
  const date = (iso: string, time = true) => {
    const part = (o: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory-nu-latn', { ...o, timeZone: 'Asia/Riyadh' }).format(new Date(iso));
    const day = part({ day: 'numeric', month: 'long' });
    return time ? `${day}${locale === 'en' ? ', ' : '، '}${part({ hour: 'numeric', minute: '2-digit' })}` : day;
  };
  const s = app.status;
  const reviewed = app.reviewedAt ? date(app.reviewedAt) : '';
  const steps = [
    { title: t('timeline.received'), sub: date(app.createdAt), dot: 'bg-success', done: true },
    { title: t('timeline.review'), sub: s === 'pending' ? t('timeline.reviewing') : reviewed, dot: s === 'pending' ? 'bg-gold' : 'bg-success', done: true },
    {
      title: t('timeline.result'),
      sub: s === 'pending' ? t('timeline.resultSoon') : t('timeline.resultDone', { status: t(`badges.${s}`), date: app.reviewedAt ? date(app.reviewedAt, false) : '' }),
      dot: s === 'pending' ? 'bg-line' : s === 'approved' ? 'bg-success' : 'bg-danger',
      done: s !== 'pending',
    },
  ];
  const last4 = app.ibanMasked.slice(-4);

  return (
    <section className={card}>
      <div className="flex flex-col gap-[6px]">
        <h1 className="text-h1 text-ink">{t(`${s}.title`)}</h1>
        <p className="text-[15px] leading-6 text-ink-2">{s === 'approved' ? t('approved.body', { phone: ltr(phone) }) : t(`${s}.body`)}</p>
      </div>
      <div className="flex items-center gap-[10px] max-md:flex-col max-md:items-start max-md:gap-s8">
        <span className={cn('rounded-pill px-s12 py-s4 text-[12px] font-medium', BADGE[s])}>{t(`badges.${s}`)}</span>
        <p className="text-[13px] text-muted">{t('number', { number: ltr(`VA-${app.id.slice(0, 8).toUpperCase()}`), date: date(app.createdAt) })}</p>
      </div>

      {s === 'rejected' && app.rejectionReason && (
        <div className="flex flex-col gap-[6px] rounded-sm bg-danger-bg p-s16">
          <p className="text-[12px] font-medium text-danger">{t('rejected.reason')}</p>
          <p className="text-[14px] leading-[22px] text-ink">{app.rejectionReason}</p>
        </div>
      )}
      {s === 'approved' && (
        // shortcut: API gap, the application answer has no commission, so the commission row of 410:40259 is left out (#45).
        <dl className="flex flex-col rounded-[14px] bg-bg px-s20 py-s12">
          <Row label={t('approved.payout')} value={t('approved.payoutValue', { iban: ltr(`SA•• •••• ${last4}`) })} />
        </dl>
      )}

      <ol aria-label={t('timeline.label')} className="flex flex-col gap-s16">
        {steps.map((st) => (
          <li key={st.title} className="flex items-start gap-s12">
            <span aria-hidden className={cn('mt-[2px] size-3.5 shrink-0 rounded-pill', st.dot)} />
            <span className="flex flex-col gap-[2px]">
              <span className={cn('text-[15px]', st.done ? 'font-medium text-ink' : 'text-muted')}>{st.title}</span>
              <span className="text-[13px] text-muted">{st.sub}</span>
            </span>
          </li>
        ))}
      </ol>

      {open && (
        <dl id="sent-application" className="flex flex-col rounded-[14px] bg-bg px-s20 py-s12">
          <Row label={t('summary.store')} value={`${app.name.ar} · ${app.name.en}`} />
          <Row label={t('summary.cr')} value={app.commercialRegistrationNumber} />
          {app.vatNumber && <Row label={t('summary.vat')} value={app.vatNumber} />}
          {app.city && <Row label={t('summary.city')} value={app.city} />}
          <Row label={t('summary.docs')} value={t('summary.docsValue', { count: app.documents.length })} />
          <Row label={t('summary.bank')} value={ltr(`SA•• •••• ${last4}`)} />
          <Row label={t('summary.holder')} value={app.accountHolderName} />
        </dl>
      )}

      <div className="flex items-center gap-s16 max-md:flex-col max-md:items-stretch">
        {s === 'pending' && (
          <Button variant="secondary" aria-expanded={open} aria-controls="sent-application" onClick={() => setOpen(!open)}>
            {t(open ? 'pending.hide' : 'pending.view')}
          </Button>
        )}
        {s === 'approved' && (
          <Link href="/login?panel=vendor" className={buttonVariants()}>
            {t('approved.enter')}
          </Link>
        )}
        {s === 'rejected' && (
          <Link href="/vendor/apply?reapply=1" className={buttonVariants()}>
            {t('rejected.reapply')}
          </Link>
        )}
        {/* shortcut: API gap, no vendor support contact (phone, email or chat) is defined yet, so this is plain text (#103). */}
        <span className="text-[14px] font-medium text-ember">{t('support')}</span>
      </div>
    </section>
  );
}
