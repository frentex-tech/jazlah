'use client';

import { cn } from '@/lib/utils';

// Figma DS «Tabs» (16:471): label/M tabs, 48 high, 16 side padding; the active one ember with a 3px ember line, the
// others ink-2 over a 1px line. Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
export function Tabs<K extends string>({ tabs, value, onChange, label, controls }: {
  tabs: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
  label: string;
  /** id of the panel the tabs control. */
  controls?: string;
}) {
  const move = (e: React.KeyboardEvent, i: number) => {
    const step = { ArrowLeft: 1, ArrowRight: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const n = (i + (e.key.startsWith('Arrow') && !rtl ? -step : step) + tabs.length) % tabs.length;
    onChange(tabs[n]!.key);
    (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className="flex h-12 w-full gap-s4">
      {tabs.map((t, i) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={controls}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.key)}
            onKeyDown={(e) => move(e, i)}
            className={cn('flex flex-col justify-between px-s16 text-label-m', active ? 'text-ember' : 'text-ink-2')}
          >
            {t.label}
            <span aria-hidden className={cn('w-full', active ? 'h-[3px] bg-ember' : 'h-px bg-line')} />
          </button>
        );
      })}
    </div>
  );
}
