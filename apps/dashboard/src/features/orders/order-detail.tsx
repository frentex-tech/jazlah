'use client';

import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { BackButton } from '@/components/shell/back-button';
import { PageHeader } from '@/components/shell/page-header';
import { PanelLoading } from '@/components/shell/panel-loading';
import { Button, buttonVariants } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FormField, InputField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { Select } from '@/components/ui/select';
import { StateCard } from '@/components/ui/state-card';
import { StatusTimeline, type TimelineStep } from '@/components/ui/status-timeline';
import { toast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { timeOf } from '@/lib/date';
import { sar } from '@/lib/money';
import { ApiError, failedState, NOT_IMPLEMENTED, ORDER_TRANSITION_NOT_ALLOWED, panelFetch, PERMISSION_DENIED } from '@/lib/panel-fetch';
import type { OrdersPanel } from './backend';
import { code39 } from './barcode';
import { dateOf, hm, nameOf } from './format';
import { awaitsCodReview, canReschedule } from './state-machine';
import type { DayOption, Order, OrderStatus } from './types';

const PinMap = dynamic(() => import('@/features/vendor-onboarding/pin-map').then((m) => m.PinMap), { ssr: false });

const card = 'flex w-full flex-col gap-s16 rounded-md border border-line bg-paper p-s20';
type Dialog = 'cancel' | 'codReject' | 'reschedule' | null;
type State = Order | 'loading' | 'error' | 'denied' | 'notFound' | 'soon';

/** What a cancel gives back (PAY-API-1 / WAL-API-1), as the mock does: the wallet part always to the wallet, the gateway part only once captured. */
export const refundOf = (o: Order) => ({ paid: o.payment.status === 'captured' ? o.totalHalalas - o.payment.walletHalalas : 0, wallet: o.payment.walletHalalas });

/**
 * ORD-DSH-1: one order (135:49134 and its states) for admins and vendors: items with their options, payment and
 * delivery, customer contact, the address on the map, the status timeline with the moves the state machine allows,
 * and for admins the COD review, cancel & refund (135:49317) and reschedule (135:49465). The printable A6 label
 * (135:49613) replaces the body.
 */
export function OrderDetail({ panel, id, adminActions = false }: { panel: OrdersPanel; id: string; adminActions?: boolean }) {
  const t = useTranslations('orderDetail');
  const to = useTranslations('orders');
  const ts = useTranslations('state');
  const tc = useTranslations('catalog.form');
  const locale = useLocale();
  const [order, setOrder] = useState<State>('loading');
  const [view, setView] = useState<'detail' | 'label'>('detail');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();
  const [refundTo, setRefundTo] = useState<'original' | 'wallet'>('original');
  const [days, setDays] = useState<DayOption[] | 'loading' | 'error'>('loading');
  const [day, setDay] = useState('');

  const fetchOrder = useCallback(
    async (quiet = false) => {
      if (!quiet) setOrder('loading');
      try {
        setOrder(await panelFetch<Order>(panel, `/api/${panel}/orders/${id}`));
      } catch (e) {
        setOrder(e instanceof ApiError && e.code === 'NOT_FOUND' ? 'notFound' : failedState(e));
      }
    },
    [panel, id],
  );
  useEffect(() => void fetchOrder(), [fetchOrder]);

  const o = typeof order === 'object' ? order : null;
  const admin = panel === 'admin';
  // Cancel & refund and reschedule are Sprint 4 routes, not in the contract: on the API both show disabled, as drawn.
  const cancellable = !!o && admin && adminActions && o.allowedTransitions.includes('cancelled');
  const openLabel = () => (view === 'label' ? window.print() : setView('label'));
  const header = (
    <PageHeader
      breadcrumb={o ? t('breadcrumb', { number: o.number }) : t('breadcrumbLoading')}
      title={o ? t('title', { number: o.number }) : t('titleLoading')}
      actions={
        o && (
          <>
            {/* 135:49134: the primary sits beside the title, the secondary outside it. */}
            <Button onClick={openLabel}>{t('printLabel')}</Button>
            {admin && (
              <Button variant="secondary" disabled={!cancellable} onClick={() => openDialog('cancel')}>
                {t('cancelRefund')}
              </Button>
            )}
          </>
        )
      }
    />
  );

  if (order === 'loading') {
    return (
      <>
        {header}
        <PanelLoading />
      </>
    );
  }
  if (!o) {
    return (
      <>
        {header}
        {order === 'error' && <StateCard kind="error" title={ts('error.title')} body={ts('error.body')} action={<Button onClick={() => void fetchOrder()}>{ts('error.action')}</Button>} />}
        {order === 'denied' && <StateCard kind="denied" title={ts('denied.title')} body={ts('denied.body')} action={<BackButton label={ts('denied.action')} panel={panel} />} />}
        {order === 'soon' && <StateCard kind="soon" title={ts('soon.title')} body={ts('soon.body')} action={<BackButton label={ts('denied.action')} panel={panel} />} />}
        {order === 'notFound' && (
          <StateCard
            kind="orders"
            title={t('notFound.title')}
            body={t(admin ? 'notFound.adminBody' : 'notFound.body')}
            action={<Link href={`/${panel}/orders`} className={buttonVariants({ variant: 'secondary' })}>{t('notFound.action')}</Link>}
          />
        )}
      </>
    );
  }

  function openDialog(d: Dialog) {
    setReason('');
    setReasonError(undefined);
    setRefundTo('original');
    setDialog(d);
    if (d === 'reschedule') {
      setDays('loading');
      setDay('');
      panelFetch<DayOption[]>('admin', `/api/admin/orders/${id}/reschedule`).then(
        (list) => {
          setDays(list);
          setDay(list.find((x) => x.isAvailable && x.date !== o!.fulfilmentDate)?.date ?? '');
        },
        () => setDays('error'),
      );
    }
  }

  /** One action: the answer replaces the order and a toast says what happened; a race reloads the order. */
  async function act(key: string, url: string, body: object, success: string) {
    setBusy(key);
    try {
      const next = await panelFetch<Order>(panel, url, { method: 'POST', body: JSON.stringify(body) });
      setOrder(next);
      setDialog(null);
      toast('success', success);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK';
      if (code === 'VALIDATION_FAILED' && (dialog === 'cancel' || dialog === 'codReject')) return setReasonError(t('cancel.reasonRequired'));
      if (code === 'DAY_NOT_AVAILABLE') {
        toast('error', t('toast.dayGone'));
        return openDialog('reschedule');
      }
      setDialog(null);
      if (code === PERMISSION_DENIED) return setOrder('denied');
      toast('error', code === NOT_IMPLEMENTED ? ts('soon.toast') : t(code === ORDER_TRANSITION_NOT_ALLOWED ? 'toast.conflict' : 'toast.failed'));
      // The moves changed (another user, the customer, an expiry): reload for the new allowedTransitions.
      if (code === ORDER_TRANSITION_NOT_ALLOWED || code === 'NOT_FOUND') void fetchOrder(true);
    } finally {
      setBusy(null);
    }
  }

  const move = (s: OrderStatus) =>
    act(s, `/api/${panel}/orders/${id}/transition`, { to: s }, s === 'confirmed' && awaitsCodReview(o) ? t('toast.codConfirmed', { number: o.number }) : t('toast.transitioned', { status: to(`statuses.${s}`) }));

  function confirmDialog() {
    if (dialog === 'reschedule') {
      if (day) void act('reschedule', `/api/admin/orders/${id}/reschedule`, { date: day }, t('toast.rescheduled'));
      return;
    }
    const r = reason.trim();
    if (!r || r.length > 500) return setReasonError(t(r ? 'cancel.reasonTooLong' : 'cancel.reasonRequired'));
    // COD reject is a plain Sprint 3 move to `cancelled` (nothing was paid); cancel & refund is the Sprint 4 route.
    if (dialog === 'codReject') void act('cancel', `/api/admin/orders/${id}/transition`, { to: 'cancelled', note: r }, t('toast.cancelled', { number: o!.number }));
    else void act('cancel', `/api/admin/orders/${id}/cancel`, { reason: r, refundTo }, t('toast.cancelled', { number: o!.number }));
  }

  const { paid, wallet } = refundOf(o);
  const methodName = `${to(`methods.${o.paymentMethod}`)}${o.payment.cardLast4 ? ` ••${o.payment.cardLast4}` : ''}`;
  const refundText =
    paid > 0 && refundTo === 'original'
      ? t(wallet > 0 ? 'cancel.split' : 'cancel.original', { amount: sar(paid, locale), method: methodName, wallet: sar(wallet, locale) })
      : paid + wallet > 0
        ? t('cancel.wallet', { amount: sar(paid + wallet, locale) })
        : t('cancel.nothing');
  const chosen = typeof days === 'object' ? days.find((x) => x.date === day) : undefined;
  // The moves come from the order (`allowedTransitions` for this caller); cancel has its own dialogs.
  const transitions = o.allowedTransitions.filter((s) => s !== 'cancelled' && !(s === 'confirmed' && awaitsCodReview(o)));
  const place = o.fulfilment === 'pickup' ? o.pickupPoint : o.address;
  const placeText = o.address
    ? [o.address.district, o.address.street, o.address.building, o.address.city].filter(Boolean).join('، ')
    : o.pickupPoint
      ? [nameOf(o.pickupPoint.name, locale), o.pickupPoint.address && nameOf(o.pickupPoint.address, locale)].filter(Boolean).join(' · ')
      : '';
  const slot = o.window ? t('payment.slotValue', { date: dateOf(o.fulfilmentDate, locale), start: hm(o.window.start, locale), end: hm(o.window.end, locale) }) : dateOf(o.fulfilmentDate, locale);
  const actionsRow = (
    <div className="flex flex-wrap gap-s12">
      <Button size="S" onClick={openLabel}>{t('printLabelA6')}</Button>
      {admin && (
        <>
          <Button size="S" variant="secondary" disabled={!adminActions || !canReschedule(o.status)} onClick={() => openDialog('reschedule')}>{t('reschedule')}</Button>
          <Button size="S" variant="danger" disabled={!cancellable} onClick={() => openDialog('cancel')}>{t('cancelRefund')}</Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {header}
      {view === 'label' ? (
        <OrderLabel order={o} slot={slot} onBack={() => setView('detail')} />
      ) : (
        <div className="flex w-full items-start gap-s24">
          <div className="flex min-w-0 flex-1 flex-col gap-s24">
            <section className={card}>
              <h2 className="text-h3 text-ink">{t('items.title', { count: o.items.length })}</h2>
              <div role="table" aria-label={t('items.title', { count: o.items.length })} className="overflow-hidden rounded-md border border-line">
                <div role="row" className="flex h-12 items-center bg-sand px-s24 text-label-m text-ink">
                  <span role="columnheader" aria-label={t('items.image')} className="w-16 shrink-0 px-s8" />
                  <span role="columnheader" className="min-w-0 flex-1 px-s8">{t('items.product')}</span>
                  <span role="columnheader" className="w-[90px] shrink-0 px-s8">{t('items.qty')}</span>
                  <span role="columnheader" className="w-[140px] shrink-0 px-s8">{t('items.price')}</span>
                </div>
                {o.items.map((i) => {
                  const opts = [
                    i.size.tag ? nameOf(i.size.tag, locale) : i.size.approxWeightGrams > 0 && t('items.grams', { value: i.size.approxWeightGrams }),
                    i.cutting && t('items.cut', { value: nameOf(i.cutting.name, locale) }),
                    i.packaging && i.packaging !== 'none' && t('items.packaging', { value: tc(`packaging.${i.packaging}`) }),
                    i.exclusions.length > 0 && t('items.without', { value: i.exclusions.map((x) => nameOf(x.name, locale)).join('، ') }),
                  ].filter(Boolean);
                  return (
                    <div key={i.id} role="row" className="flex min-h-16 items-center border-t border-line px-s24 text-body-m text-ink">
                      <span role="cell" className="w-16 shrink-0 px-s8">
                        {i.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- the API's public CDN URL, shown as is
                          <img src={i.imageUrl} alt="" className="size-10 rounded-sm object-cover" />
                        ) : (
                          <span aria-hidden className="block size-10 rounded-sm bg-sand" />
                        )}
                      </span>
                      <span role="cell" className="flex min-w-0 flex-1 flex-col px-s8 py-s8">
                        {nameOf(i.name, locale)}
                        {opts.length > 0 && <span className="text-caption text-ink-2">{opts.join(' · ')}</span>}
                      </span>
                      <span role="cell" className="w-[90px] shrink-0 px-s8">{i.quantity}</span>
                      <span role="cell" className="w-[140px] shrink-0 px-s8">{sar(i.totalHalalas, locale)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={card}>
              <h2 className="text-h3 text-ink">{t('payment.title')}</h2>
              <dl className="flex flex-col gap-s16">
                <Row label={t('payment.subtotal')} value={sar(o.subtotalHalalas, locale)} />
                {o.discountHalalas > 0 && <Row label={t('payment.discount')} value={`- ${sar(o.discountHalalas, locale)}`} />}
                {o.fulfilment === 'delivery' && <Row label={t('payment.delivery')} value={sar(o.deliveryFeeHalalas, locale)} />}
                <Row label={t('payment.total')} value={sar(o.totalHalalas, locale)} />
                <Row label={t('payment.method')} value={methodName} />
                {o.payment.walletHalalas > 0 && o.paymentMethod !== 'wallet' && <Row label={t('payment.fromWallet')} value={sar(o.payment.walletHalalas, locale)} />}
                {o.refunds.map((r) => (
                  <Row key={r.id} label={t(`payment.refund.${r.destination}`)} value={`${sar(r.amountHalalas, locale)} · ${t(`payment.refundStatus.${r.status}`)}`} />
                ))}
                <Row
                  label={t('payment.customer')}
                  value={
                    <>
                      {o.customer.name ?? '—'} ·{' '}
                      <a href={`tel:${o.customer.phone.replace(/\s/g, '')}`} className="underline-offset-2 hover:underline">
                        <bdi dir="ltr">{o.customer.phone}</bdi>
                      </a>
                    </>
                  }
                />
                <Row label={t('payment.store')} value={[nameOf(o.vendor.name, locale), o.vendor.city].filter(Boolean).join(' · ')} />
                <Row label={t(o.fulfilment === 'pickup' ? 'payment.pickupSlot' : 'payment.slot')} value={slot} />
                {o.notes && <Row label={t('payment.notes')} value={o.notes} />}
                {o.cancelReason && <Row label={t('payment.cancelReason')} value={o.cancelReason} />}
              </dl>
              {actionsRow}
            </section>
          </div>

          <aside className="flex w-[378px] shrink-0 flex-col gap-s24">
            <section className={card}>
              <h2 className="text-h3 text-ink">{t('status.title')}</h2>
              <StatusTimeline label={t('status.title')} steps={stepsOf(o, (k) => to(`statuses.${k}`), (k) => t(`status.steps.${k}`), locale)} />
              {admin && awaitsCodReview(o) && (
                <>
                  <Notice tone="sand" role="status" text={t('cod.notice')} />
                  <div className="flex gap-s12">
                    <Button size="S" className="flex-1" loading={busy === 'confirmed'} disabled={!!busy} onClick={() => void move('confirmed')}>{t('cod.confirm')}</Button>
                    <Button size="S" variant="secondary" className="flex-1" disabled={!!busy} onClick={() => openDialog('codReject')}>{t('cod.reject')}</Button>
                  </div>
                </>
              )}
              {transitions.length > 0 && (
                <div role="group" aria-label={t('status.actions')} className="flex flex-wrap gap-s12">
                  {transitions.map((s, i) => (
                    <Button key={s} size="S" variant={i === 0 ? 'primary' : 'secondary'} className="flex-1" loading={busy === s} disabled={!!busy} onClick={() => void move(s)}>
                      {t(`next.${s}`)}
                    </Button>
                  ))}
                </div>
              )}
            </section>

            {place && (
              <section className={card}>
                <h2 className="text-h3 text-ink">{t(o.fulfilment === 'pickup' ? 'location.pickup' : 'location.delivery')}</h2>
                {place.location && (
                  <div className="h-40 overflow-hidden rounded-md bg-sand">
                    <PinMap value={place.location} label={t(o.fulfilment === 'pickup' ? 'location.pickup' : 'location.delivery')} pin="address" />
                  </div>
                )}
                <p className="text-body-m text-ink-2">{placeText}</p>
                {o.address?.driverInstructions && <p className="text-body-m text-ink-2">{t('location.notes', { value: o.address.driverInstructions })}</p>}
              </section>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={dialog !== null}
        onOpenChange={(v) => !v && !busy && setDialog(null)}
        title={dialog === 'reschedule' ? t('rescheduleDialog.title') : dialog === 'codReject' ? t('codReject.title', { number: o.number }) : t('cancel.title', { number: o.number })}
        body={
          dialog === 'reschedule'
            ? chosen?.window
              ? t('rescheduleDialog.body', { date: dateOf(chosen.date, locale), start: hm(chosen.window.start, locale), end: hm(chosen.window.end, locale) })
              : t('rescheduleDialog.pick')
            : dialog === 'codReject'
              ? t('codReject.body')
              : refundText
        }
        confirmLabel={dialog === 'reschedule' ? t('rescheduleDialog.confirm') : dialog === 'codReject' ? t('codReject.confirm') : t('cancel.confirm')}
        cancelLabel={dialog === 'reschedule' ? undefined : t('cancel.back')}
        destructive={dialog !== 'reschedule'}
        loading={busy === 'cancel' || busy === 'reschedule'}
        wide
        onConfirm={confirmDialog}
      >
        {dialog === 'reschedule' &&
          (days === 'loading' ? (
            <p role="status" className="text-body-m text-ink-2">{ts('loading')}</p>
          ) : days === 'error' ? (
            <p role="alert" className="text-body-m text-danger">{ts('error.body')}</p>
          ) : (
            <FormField label={t('rescheduleDialog.day')}>
              {({ id: fid }) => (
                <Select id={fid} value={day} onChange={(e) => setDay(e.target.value)} className="w-full">
                  <option value="" disabled>{t('rescheduleDialog.pick')}</option>
                  {days.map((x) => (
                    <option key={x.date} value={x.date} disabled={!x.isAvailable || x.date === o.fulfilmentDate}>
                      {dateOf(x.date, locale)}
                      {x.date === o.fulfilmentDate ? ` (${t('rescheduleDialog.current')})` : x.reason ? ` (${t(`rescheduleDialog.reasons.${x.reason}`)})` : ''}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          ))}
        {dialog === 'cancel' && paid > 0 && (
          <div role="group" aria-label={t('cancel.refundTo')} className="flex flex-wrap gap-s8">
            <Chip selected={refundTo === 'original'} onClick={() => setRefundTo('original')}>{t('cancel.toOriginal', { method: methodName })}</Chip>
            <Chip selected={refundTo === 'wallet'} onClick={() => setRefundTo('wallet')}>{t('cancel.toWallet')}</Chip>
          </div>
        )}
        {(dialog === 'cancel' || dialog === 'codReject') && (
          <InputField
            label={t('cancel.reason')}
            error={reasonError}
            maxLength={500}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(undefined);
            }}
          />
        )}
      </ConfirmDialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-s12 text-body-m">
      <dt className="text-ink-2">{label}</dt>
      <dd className="text-end text-ink">{value}</dd>
    </div>
  );
}

/** Timeline of 135:49134: received, preparing, slaughtered and prepared, on the way, delivered (pickup: collected). */
function stepsOf(o: Order, statusLabel: (s: OrderStatus) => string, stepLabel: (s: string) => string, locale: string): TimelineStep[] {
  const path: OrderStatus[] = o.fulfilment === 'pickup' ? ['confirmed', 'preparing', 'ready', 'collected'] : ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const at = (s: OrderStatus) => [...o.history].reverse().find((h) => h.to === s)?.at;
  const reached = Math.max(-1, ...o.history.map((h) => path.indexOf(h.to === 'picked_up' ? 'ready' : h.to)));
  const steps: TimelineStep[] = path.map((s, i) => {
    const time = at(s);
    return { key: s, label: stepLabel(s), time: i <= reached && time ? timeOf(time, locale) : undefined, state: i < reached ? 'done' : i === reached ? 'current' : 'todo' };
  });
  const final = o.status === 'delivered' || o.status === 'collected';
  if (final) return steps.map((s) => ({ ...s, state: 'done' }));
  if (o.status === 'pending_payment' || o.status === 'new') return [{ key: o.status, label: statusLabel(o.status), time: timeOf(o.createdAt, locale), state: 'current' }, ...steps];
  if (o.status === 'cancelled' || o.status === 'delivery_failed' || o.status === 'returned') {
    const time = at(o.status);
    return [
      ...steps.slice(0, reached + 1).map((s) => ({ ...s, state: 'done' as const })),
      { key: o.status, label: statusLabel(o.status), time: time ? timeOf(time, locale) : undefined, state: 'current', danger: true },
    ];
  }
  return steps;
}

/** The A6 label (135:49613): order number, customer, store, slot, weight, and the Code 39 barcode of the number. */
function OrderLabel({ order: o, slot, onBack }: { order: Order; slot: string; onBack: () => void }) {
  const t = useTranslations('orderDetail.label');
  const locale = useLocale();
  const grams = o.items.reduce((a, i) => a + i.size.approxWeightGrams * i.quantity, 0);
  const bars = code39(o.number);
  return (
    <div className="flex min-h-[520px] w-full flex-col items-center justify-center gap-s16 bg-bg">
      <section className="print-label flex w-[420px] flex-col gap-s16 rounded-md border border-line bg-paper p-s20" aria-label={t('title')}>
        <h2 className="text-h3 text-ink print:hidden">{t('title')}</h2>
        <dl className="flex flex-col gap-s16">
          <Row label={t('number')} value={<bdi dir="ltr">{o.number}</bdi>} />
          <Row label={t('customer')} value={o.customer.name ?? '—'} />
          <Row label={t('store')} value={nameOf(o.vendor.name, locale)} />
          <Row label={t(o.fulfilment === 'pickup' ? 'pickupSlot' : 'slot')} value={slot} />
          {grams > 0 && <Row label={t('weight')} value={t('kg', { value: Number((grams / 1000).toFixed(2)) })} />}
        </dl>
        {bars && (
          <svg role="img" aria-label={t('barcode', { number: o.number })} viewBox={`0 0 ${bars.length} 56`} preserveAspectRatio="none" className="h-14 w-[168px] self-start text-ink">
            {[...bars].map((b, i) => (b === '1' ? <rect key={i} x={i} width={1} height={56} fill="currentColor" /> : null))}
          </svg>
        )}
      </section>
      <div className="flex gap-s12 print:hidden">
        <Button onClick={() => window.print()}>{t('print')}</Button>
        <Button variant="secondary" onClick={onBack}>{t('back')}</Button>
      </div>
    </div>
  );
}
