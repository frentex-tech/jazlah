// Drafts of the vendor application on this device. The tab draft follows step back/forward and a session that ends
// mid-way (sessionStorage); «save and finish later» keeps one in localStorage for 7 days. Each is tagged with the
// applicant's user id, and one of another applicant (or an older one) is dropped. The IBAN is never kept: it is asked
// for again. Submitting and signing out delete both.
const KEYS = { tab: 'jz:vendor-application', later: 'jz:vendor-application-later' } as const;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type Draft<V> = { owner: string; at: number; step: number; values: V };

export function writeDraft<V extends { iban: string }>(where: keyof typeof KEYS, owner: string, step: number, values: V) {
  if (!owner) return;
  const store = where === 'tab' ? sessionStorage : localStorage;
  store.setItem(KEYS[where], JSON.stringify({ owner, at: Date.now(), step, values: { ...values, iban: '' } } satisfies Draft<V>));
}

/** The applicant's own draft (tab first, then «later»); drafts of anyone else, expired or corrupt ones are deleted. */
export function readDraft<V>(owner: string): { step: number; values: Partial<V> } | null {
  for (const [store, key] of [[sessionStorage, KEYS.tab], [localStorage, KEYS.later]] as const) {
    const raw = store.getItem(key);
    if (!raw) continue;
    try {
      const d = JSON.parse(raw) as Draft<Partial<V>>;
      if (owner && d.owner === owner && Date.now() - d.at < MAX_AGE_MS) return { step: Math.min(4, Math.max(0, d.step | 0)), values: d.values };
    } catch {
      // corrupt: dropped below
    }
    store.removeItem(key);
  }
  return null;
}

export function clearDrafts() {
  sessionStorage.removeItem(KEYS.tab);
  localStorage.removeItem(KEYS.later);
}
