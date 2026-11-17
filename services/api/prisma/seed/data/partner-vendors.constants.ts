import type { SeedPartnerVendor } from './seed-partner-vendor.type';

/**
 * The seeded partner vendors, each from its approved application: three active, one
 * suspended (its products stay out of the public lists).
 */
export const SEED_PARTNER_VENDORS: readonly SeedPartnerVendor[] = [
  {
    key: 'nokhba',
    application: 'nokhba',
    commissionBasisPoints: 1250,
    logoColor: '#7A1F2B',
    suspensionReason: null,
  },
  {
    key: 'wadi',
    application: 'wadi',
    commissionBasisPoints: 1000,
    logoColor: '#2F5D3A',
    suspensionReason: null,
  },
  {
    key: 'najd',
    application: 'najd',
    commissionBasisPoints: 1500,
    logoColor: '#8C6A2F',
    suspensionReason: null,
  },
  {
    key: 'souq',
    application: 'souq',
    commissionBasisPoints: 1200,
    logoColor: '#4A4A6A',
    suspensionReason:
      'تأخر متكرر في التوصيل حسب بلاغات العملاء. موقوف لحين مراجعة المالك.',
  },
];
