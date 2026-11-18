'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { OtpField } from '@/components/ui/otp-field';
import { PhoneInput } from '@/components/ui/phone-input';
import { Link } from '@/i18n/navigation';
import { formatNational } from '@/lib/phone';
import type { Panel } from '@/lib/session';
import { CardTitle } from './login-layout';

type ApiError = { code: string; retryAfter?: number };

async function post<T>(url: string, body: unknown): Promise<T | ApiError> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return (await res.json()) as T | ApiError;
  } catch {
    return { code: 'NETWORK' };
  }
}
const isError = (r: object): r is ApiError => 'code' in r;

/** Phone → code. Each step follows the Figma states: default, loading (spinner in the button), error. */
export function LoginFlow({ panel, next, otpLength }: { panel: Panel; next?: string; otpLength: number }) {
  const t = useTranslations('login');
  const locale = useLocale();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>(); // second line under the OTP error
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const now = useNow();
  const otpRef = useRef<HTMLInputElement>(null);

  const message = (e: ApiError) => {
    switch (e.code) {
      case 'VALIDATION_FAILED': return t('errors.phoneInvalid');
      case 'OTP_INVALID': return t('errors.otpInvalid');
      case 'OTP_EXPIRED': return t('errors.otpExpired');
      case 'RATE_LIMITED': return t('errors.rateLimited', { seconds: e.retryAfter ?? 60 });
      case 'ACCOUNT_DISABLED': return t('errors.disabled');
      case 'VENDOR_SUSPENDED': return t('errors.suspended');
      default: return t('errors.unavailable');
    }
  };

  async function sendCode() {
    setLoading(true);
    setError(undefined);
    const r = await post<{ resendAfterSeconds: number }>('/api/auth/otp/request', { phone: digits, panel, lang: locale });
    setLoading(false);
    if (isError(r)) return setError(message(r));
    setResendAt(Date.now() + r.resendAfterSeconds * 1000);
    setCode('');
    setHint(undefined);
    setStep('otp');
  }

  async function verify() {
    setLoading(true);
    setError(undefined);
    setHint(undefined);
    const r = await post<{ redirect: string }>('/api/auth/otp/verify', { phone: digits, panel, code, next, lang: locale });
    if (!isError(r)) return window.location.assign(r.redirect); // full load, so the middleware sees the new cookies
    setLoading(false);
    setError(message(r));
    // A staff sign-in without access fails like a wrong code (docs/frontend/auth.md), so say both.
    if (r.code === 'OTP_INVALID') setHint(t('errors.noAccess', { panel: t(`${panel}.panelName`) }));
    otpRef.current?.focus();
  }

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus();
  }, [step]);

  if (step === 'phone') {
    const complete = /^5\d{8}$/.test(digits);
    return (
      <form
        className="contents"
        onSubmit={(e) => {
          e.preventDefault();
          if (complete && !loading) void sendCode();
        }}
      >
        <CardTitle title={t(`${panel}.title`)} subtitle={t(`${panel}.subtitle`)} />
        <PhoneInput
          label={t('phoneLabel')}
          placeholder={t('phonePlaceholder')}
          hint={t('phoneHint')}
          error={error}
          value={digits}
          onChange={(d) => {
            setDigits(d);
            setError(undefined);
          }}
          onBlur={() => digits && !complete && setError(t('errors.phoneInvalid'))}
        />
        <Button type="submit" className="w-full" disabled={!complete} loading={loading}>
          {t('send')}
        </Button>
        <Footer panel={panel} />
      </form>
    );
  }

  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));
  return (
    <form
      className="contents"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === otpLength && !loading) void verify();
      }}
    >
      <CardTitle
        title={t('otpTitle')}
        subtitle={t('otpSent', { length: otpLength, number: `\u2066+966 ${formatNational(digits)}\u2069` }) /* LRI…PDI keeps the number left to right */}
      />
      <div className="flex flex-col items-center gap-s8">
        <OtpField
          ref={otpRef}
          length={otpLength}
          value={code}
          label={t('otpLabel')}
          error={error}
          onChange={(v) => {
            setCode(v);
            setError(undefined);
            setHint(undefined);
          }}
        />
        {hint && <p className="max-w-[358px] text-center text-body-m text-ink-2">{hint}</p>}
      </div>
      <Button variant="ghost" size="S" className="self-start" disabled={wait > 0 || loading} onClick={() => void sendCode()}>
        {wait > 0 ? t('resendIn', { time: `${String(Math.floor(wait / 60)).padStart(2, '0')}:${String(wait % 60).padStart(2, '0')}` }) : t('resend')}
      </Button>
      <Button type="submit" className="w-full" disabled={code.length !== otpLength} loading={loading}>
        {t('confirm')}
      </Button>
    </form>
  );
}

function Footer({ panel }: { panel: Panel }) {
  const t = useTranslations(`login.${panel}`);
  if (panel !== 'vendor') return <p className="text-body-m text-ink-2">{t('footer')}</p>;
  return (
    <p className="text-body-m text-ink-2">
      {t('footer')}{' '}
      <Link href="/vendor/apply" className="hover:underline">
        {t('apply')}
      </Link>
    </p>
  );
}

/** Current time, ticking every second (for the resend countdown). */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
