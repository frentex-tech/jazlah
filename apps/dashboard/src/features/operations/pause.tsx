'use client';

import { PauseCircle } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputField } from '@/components/ui/form-field';
import { Notice } from '@/components/ui/notice';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { ApiError, NOT_IMPLEMENTED, panelFetch, PERMISSION_DENIED } from '@/lib/panel-fetch';
import { errorKey, PausedSchema, zodErrors, type FieldErrors } from './schema';
import type { OperationsSettings, Paused, SetPause } from './types';
import { fieldErrors } from '@/features/catalog/client';

type PauseState = { paused: Paused | null; sync: (p: Paused) => void; apply: (p: SetPause) => Promise<OperationsSettings> };
const Ctx = createContext<PauseState>({ paused: null, sync: () => {}, apply: () => Promise.reject(new ApiError('NETWORK')) });
export const usePause = () => useContext(Ctx);

/**
 * The pause switch state for the whole admin panel (FR-SCH-07): read once by the admin layout, changed from the header
 * or the operations page, shown on every admin page. `initial` is null when it could not be read (API down, not built).
 */
export function PauseProvider({ initial, children }: { initial: Paused | null; children: React.ReactNode }) {
  const [paused, sync] = useState(initial);
  // A new server read (navigation, refresh) wins.
  useEffect(() => {
    if (initial) sync(initial);
  }, [initial]);
  const apply = useCallback(async (p: SetPause) => {
    const s = await panelFetch<OperationsSettings>('admin', '/api/admin/settings/operations/pause', { method: 'PUT', body: JSON.stringify(p) });
    sync(s.paused);
    return s;
  }, []);
  return <Ctx.Provider value={{ paused, sync, apply }}>{children}</Ctx.Provider>;
}

/** The confirmation of 118:12270 (pause) and its resume twin; `withMessage` adds the AR/EN message (header switch). */
export function PauseDialog({ open, onOpenChange, current, withMessage, onConfirm, onInvalid }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  current: Paused;
  withMessage?: boolean;
  /** Called with the new state; resolves to field errors to show, or nothing when done. */
  onConfirm: (p: SetPause) => Promise<FieldErrors | void>;
  /** Without `withMessage` the messages are edited outside: refused ones go back there and the dialog closes. */
  onInvalid?: (errors: FieldErrors) => void;
}) {
  const t = useTranslations('operations.pause');
  const te = useTranslations('operations.errors');
  // The API answers the messages null while not paused.
  const initial = () => ({ messageAr: current.messageAr ?? '', messageEn: current.messageEn ?? '' });
  const [msg, setMsg] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const pausing = !current.isPaused;
  const err = (k: 'messageAr' | 'messageEn') => (errors[`paused.${k}`] ? te(errorKey(`paused.${k}`, errors[`paused.${k}`]!)) : undefined);

  async function confirm() {
    const next = { ...current, ...(withMessage && msg), isPaused: pausing };
    const parsed = PausedSchema.safeParse(next);
    if (!parsed.success) {
      const e = Object.fromEntries(Object.entries(zodErrors(parsed.error)).map(([k, v]) => [`paused.${k}`, v]));
      if (withMessage) return setErrors(e);
      onOpenChange(false);
      return onInvalid?.(e);
    }
    setBusy(true);
    const e = await onConfirm(parsed.data).finally(() => setBusy(false));
    if (e) setErrors(e);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        if (o) setMsg(initial());
        setErrors({});
        onOpenChange(o);
      }}
      title={t(pausing ? 'confirmTitle' : 'resumeTitle')}
      body={t(pausing ? 'confirmBody' : 'resumeBody')}
      confirmLabel={t(pausing ? 'confirm' : 'resume')}
      destructive={pausing}
      loading={busy}
      wide={withMessage && pausing}
      onConfirm={() => void confirm()}
    >
      {withMessage && pausing && (
        <>
          <InputField label={t('messageAr')} error={err('messageAr')} maxLength={200} dir="rtl" value={msg.messageAr} onChange={(e) => setMsg((m) => ({ ...m, messageAr: e.target.value }))} />
          <InputField label={t('messageEn')} error={err('messageEn')} maxLength={200} dir="ltr" value={msg.messageEn} onChange={(e) => setMsg((m) => ({ ...m, messageEn: e.target.value }))} />
        </>
      )}
    </ConfirmDialog>
  );
}

/** What a failed pause change shows: the fields refused, or a toast (and nothing to show in the dialog). */
export function pauseErrors(e: unknown, t: (k: string) => string, soon: string): FieldErrors | void {
  const fields = fieldErrors(e);
  // The pause route's fields are the Paused keys; the page and dialog show them under `paused.`.
  if (fields) return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k.startsWith('paused.') ? k : `paused.${k}`, v]));
  const code = e instanceof ApiError ? e.code : '';
  toast('error', code === NOT_IMPLEMENTED ? soon : t(code === PERMISSION_DENIED ? 'denied' : 'failed'));
}

/** The always-visible header switch (top bar), with its badge while paused. */
export function PauseSwitch() {
  const t = useTranslations('operations.pause');
  const ts = useTranslations('state');
  const { paused, apply } = usePause();
  const [open, setOpen] = useState(false);
  if (!paused) return null;
  return (
    <div className="flex items-center gap-s12">
      {paused.isPaused && <Badge type="warning" size="M">{t('badgePaused')}</Badge>}
      <Switch label={t('headerSwitch')} checked={paused.isPaused} onChange={() => setOpen(true)} />
      <PauseDialog
        open={open}
        onOpenChange={setOpen}
        current={paused}
        withMessage
        onConfirm={async (p) => {
          try {
            await apply(p);
            setOpen(false);
            toast('success', t(p.isPaused ? 'pausedToast' : 'resumedToast'));
          } catch (e) {
            const fields = pauseErrors(e, t, ts('soon.toast'));
            if (fields) return fields;
            setOpen(false);
          }
        }}
      />
    </div>
  );
}

/** The banner every admin page shows while ordering is paused. */
export function PauseBanner() {
  const t = useTranslations('operations.pause');
  const locale = useLocale();
  const { paused } = usePause();
  if (!paused?.isPaused) return null;
  return <Notice role="status" icon={PauseCircle} text={t('banner', { message: (locale === 'en' ? paused.messageEn : paused.messageAr) ?? '' })} />;
}
