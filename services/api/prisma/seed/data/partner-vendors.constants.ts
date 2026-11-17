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
    coverColor: '#C9A27E',
    contactPhone: '0112345678',
    contactEmail: 'contact@nokhba.example.com',
    suspensionReason: null,
  },
  {
    key: 'wadi',
    application: 'wadi',
    commissionBasisPoints: 1000,
    logoColor: '#2F5D3A',
    coverColor: '#A8C3A0',
    contactPhone: '0500000101',
    contactEmail: 'info@wadi.example.com',
    suspensionReason: null,
  },
  {
    key: 'najd',
    application: 'najd',
    commissionBasisPoints: 1500,
    logoColor: '#8C6A2F',
    coverColor: '#D8C3A5',
    contactPhone: '0500000102',
    contactEmail: 'orders@najd.example.com',
    suspensionReason: null,
  },
  {
    key: 'souq',
    application: 'souq',
    commissionBasisPoints: 1200,
    logoColor: '#4A4A6A',
    coverColor: '#9FA0B8',
    contactPhone: '0500000103',
    contactEmail: 'souq@example.com',
    suspensionReason:
      'تأخر متكرر في التوصيل حسب بلاغات العملاء. موقوف لحين مراجعة المالك.',
  },
];
