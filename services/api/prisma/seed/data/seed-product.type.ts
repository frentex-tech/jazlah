import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';
import type { SeedPackaging } from './seed-packaging.type';
import type { SeedProductChange } from './seed-product-change.type';
import type { SeedProductSize } from './seed-product-size.type';

/**
 * A product the seed creates, in one of the states a dashboard shows. Lists name their
 * entries by key (SeedReferenceItem). A product under review or published has a size,
 * an image and no incompatible cutting and packaging, as a submission requires
 * (checked by `seed-data.spec.ts`).
 */
export type SeedProduct = Readonly<{
  key: string;
  /** `platform` or a SeedPartnerVendor key. */
  vendor: string;
  category: string;
  /** Null when the product names no meat type (a mix). */
  meatType: string | null;
  name: LocalizedText;
  description: OptionalLocalizedText;
  fulfilment: 'delivery' | 'pickup' | 'both';
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  /** False for a published product the vendor marked unavailable. */
  isAvailable: boolean;
  /** Set exactly when the status is rejected. */
  rejectionReason: string | null;
  /** How many placeholder images: solid colours of the meat type's palette. */
  images: number;
  sizes: readonly SeedProductSize[];
  cuttings: readonly Readonly<{ style: string; extraPriceHalalas: number }>[];
  packagings: readonly SeedPackaging[];
  exclusions: readonly string[];
  /** A pending change request on this (published) product, or null. */
  pendingChange: SeedProductChange | null;
}>;
