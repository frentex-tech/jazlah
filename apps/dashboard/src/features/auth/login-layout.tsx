import { ChartLineUp, ListChecks, LockSimple } from '@phosphor-icons/react/dist/ssr';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import type { Session } from '@/lib/session';

const photo: Record<Session, string> = { admin: '/login/admin.jpg', vendor: '/login/vendor.jpg', kitchen: '/login/vendor.jpg', customer: '/login/vendor.jpg' };

// Sign-in frame from Figma 118:5934 (admin), 352:59207 (vendor), 410:38561 (kitchen): form on the start side,
// photo panel with the panel's pitch on the end side. `customer`: the vendor application's sign-in (410:40299).
export async function LoginLayout({ panel, children }: { panel: Session; children: React.ReactNode }) {
  const t = await getTranslations(`login.${panel}`);
  const points = [
    { icon: ListChecks, weight: 'fill' as const, title: t('p1'), body: t('p1b') },
    { icon: ChartLineUp, weight: 'regular' as const, title: t('p2'), body: t('p2b') },
    { icon: LockSimple, weight: 'regular' as const, title: t('p3'), body: t('p3b') },
  ];
  return (
    <div className="flex min-h-screen bg-bg">
      <main className="flex flex-1 items-center justify-center px-20 py-16">
        <div className="flex flex-col items-center gap-s24">
          <div className="flex flex-col items-center gap-s4">
            <Image src="/logo-jazla-on-light.svg" alt="JAZLA" width={61} height={60} priority />
            <p className="text-body-m text-muted">{t('brand')}</p>
          </div>
          {children}
        </div>
      </main>

      <aside className="relative flex w-1/2 shrink-0 flex-col items-start justify-between isolate overflow-hidden p-16">
        <Image src={photo[panel]} alt="" fill priority sizes="50vw" className="-z-10 object-cover" />
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgb(36_8_9/0.6)] to-[rgb(36_8_9/0.96)]" />
        <Image src="/logo-jazla.svg" alt="" width={98} height={96} />
        <div className="flex max-w-[520px] flex-col gap-[28px] text-paper">
          <div className="flex flex-col gap-s12">
            <h2 className="font-display text-[44px] font-bold leading-[60px]">{t('heroTitle')}</h2>
            <p className="text-[16px] leading-[28px]">{t('heroBody')}</p>
          </div>
          <ul className="flex flex-col gap-[18px]">
            {points.map((p) => (
              <li key={p.title} className="flex items-center gap-[14px]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-[rgb(255_250_247/0.14)]">
                  <p.icon size={22} weight={p.weight} className="text-gold-light" aria-hidden />
                </span>
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[16px] font-bold leading-[20px]">{p.title}</span>
                  <span className="text-[13px] leading-[16px]">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

/** Digits in a code: the API's AUTH_OTP_LENGTH, mirrored by the OTP_LENGTH setting (4 to 8, 6 by default). */
export const otpLength = () => Math.min(8, Math.max(4, Number(process.env.OTP_LENGTH) || 6));

/** The 422px white card that holds each step. */
export function LoginCard({ children }: { children: React.ReactNode }) {
  return <div className="flex w-[422px] flex-col items-stretch gap-s24 rounded-lg bg-paper p-s32">{children}</div>;
}

export function CardTitle({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-s8">
      <h1 className="text-h1 text-ink">{title}</h1>
      <p className="text-body-m text-ink-2">{subtitle}</p>
    </div>
  );
}
