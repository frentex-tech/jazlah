'use client';

import { uploadWithTicket } from '@/components/ui/file-upload';
import { ApiError, panelFetch } from '@/lib/panel-fetch';
import type { Page, UploadTicket } from './types';

/** Every page of a cursor-paged admin list (50 a page): the catalog lists and rules are short. */
export async function loadAll<T>(url: string): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | null = null;
  do {
    const q = new URLSearchParams({ limit: '50', ...(cursor && { cursor }) });
    const p: Page<T> = await panelFetch<Page<T>>('admin', `${url}${url.includes('?') ? '&' : '?'}${q}`);
    out.push(...p.items);
    cursor = p.nextCursor;
  } while (cursor);
  return out;
}

/** Ticket, upload straight to storage, confirm (docs/frontend/uploads.md): the confirmed media id. */
export async function uploadAdminImage(purpose: 'catalog.product-image' | 'catalog.category-image', file: File): Promise<string> {
  const ticket = await panelFetch<UploadTicket>('admin', '/api/admin/media/uploads', {
    method: 'POST',
    body: JSON.stringify({ purpose, contentType: file.type, fileName: file.name.slice(0, 255) }),
  });
  await uploadWithTicket(file, ticket);
  await panelFetch('admin', `/api/admin/media/${ticket.mediaId}/confirm`, { method: 'POST' });
  return ticket.mediaId;
}

/** VALIDATION_FAILED details as `{ "sizes.2.priceHalalas": "isLivePrice" }` (the first constraint of each field). */
export function fieldErrors(e: unknown): Record<string, string> | null {
  if (!(e instanceof ApiError) || e.code !== 'VALIDATION_FAILED' || !Array.isArray(e.details)) return null;
  const out: Record<string, string> = {};
  for (const d of e.details as { field?: string; constraints?: string[] }[]) if (d.field) out[d.field] = d.constraints?.[0] ?? 'invalid';
  return out;
}
