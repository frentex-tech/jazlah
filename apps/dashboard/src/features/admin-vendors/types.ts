import type { Schemas } from '@/api/client';

// The API's own shapes (services/api/openapi.json → src/api/schema.d.ts), admin side of docs/frontend/vendors.md.
export type Application = Schemas['VendorApplicationResponseDto'];
export type ApplicationDetail = Schemas['VendorApplicationDetailResponseDto'];
export type Vendor = Schemas['AdminVendorResponseDto'];
export type Page<T> = { items: T[]; nextCursor: string | null };

export type ApplicationQuery = { status?: Application['status']; q?: string; cursor?: string; limit?: number };
export type VendorQuery = { status?: Vendor['status']; q?: string; city?: string; cursor?: string; limit?: number };

/**
 * One review screen for both: a pending application has no vendor yet; a vendor shows the application it came from
 * (its documents). The platform vendor has neither application nor documents.
 */
export type Review = { vendor: Vendor | null; application: ApplicationDetail | null };

/** The list's status tabs (131:16744): applications waiting for review, then vendors by status. */
export const TABS = ['pending', 'active', 'suspended'] as const;
export type Tab = (typeof TABS)[number];

/** Percent with up to two decimals (what the admin types) ↔ basis points (what the API takes): 12.5 ↔ 1250. */
export const percentOf = (bps: number) => bps / 100;
export function bpsOf(percent: string): number | null {
  const s = percent.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const bps = Math.round(Number(s) * 100);
  return bps <= 10000 ? bps : null;
}
