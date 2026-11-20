'use client';

import { CheckCircle, Info, Warning, XCircle } from '@phosphor-icons/react';
import { useSyncExternalStore } from 'react';

// Figma DS «Toast» (16:561): 342 wide, paper, line border, r18, card shadow, 12/16 padding, filled icon then Body/M text.
// Shown at the bottom centre of the window for 4 s; a polite live region reads it out.
type Kind = 'success' | 'error' | 'warning' | 'info';
type Item = { id: number; kind: Kind; message: string };

const icons = {
  success: <CheckCircle size={24} weight="fill" className="shrink-0 text-success" aria-hidden />,
  error: <XCircle size={24} weight="fill" className="shrink-0 text-danger" aria-hidden />,
  warning: <Warning size={24} weight="fill" className="shrink-0 text-warning" aria-hidden />,
  info: <Info size={24} weight="fill" className="shrink-0 text-info" aria-hidden />,
};

let items: Item[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Shows a toast from anywhere on the client (the Toaster sits in the panel shell). */
export function toast(kind: Kind, message: string) {
  const id = ++seq;
  items = [...items, { id, kind, message }];
  emit();
  setTimeout(() => {
    items = items.filter((i) => i.id !== id);
    emit();
  }, 4000);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const none: Item[] = [];

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => none);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-s24 z-50 flex flex-col items-center gap-s8">
      {list.map((t) => (
        <div key={t.id} className="flex w-[342px] items-center gap-s12 rounded-md border border-line bg-paper px-s16 py-s12 shadow-card">
          {icons[t.kind]}
          <p className="flex-1 text-body-m text-ink">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
