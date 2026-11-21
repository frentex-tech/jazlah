'use client';

import { useEffect } from 'react';
import { clearDrafts } from './drafts';

/** Ends the customer session only (api/auth/logout `only=customer`), and drops the application drafts on this device. */
export function CustomerSignOut({ locale, label, className }: { locale: string; label: string; className: string }) {
  return (
    <form action="/api/auth/logout" method="post" onSubmit={clearDrafts}>
      <input type="hidden" name="only" value="customer" />
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

/** On the sign-in page after the server ended the session (`?reason=`): the drafts on this device go too. */
export function ClearDrafts() {
  useEffect(clearDrafts, []);
  return null;
}
