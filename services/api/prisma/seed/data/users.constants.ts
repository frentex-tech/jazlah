import type { SeedUser } from './seed-user.type';

/**
 * Everyone the seed creates, in one clearly fake block of numbers (+9665000000NN):
 * 01 to 06 the development accounts, 11 to 13 the owners of the other vendors, 21 and
 * 22 applicants, 31 to 33 customers.
 */
export const SEED_USERS: readonly SeedUser[] = [
  {
    key: 'dev-customer',
    phone: '0500000001',
    role: 'development customer',
  },
  {
    key: 'dev-vendor',
    phone: '0500000002',
    role: 'development vendor (owner of Al Nokhba Butchery)',
  },
  {
    key: 'dev-kitchen',
    phone: '0500000003',
    role: 'development kitchen (works for the platform vendor)',
  },
  { key: 'dev-admin', phone: '0500000004', role: 'development admin' },
  {
    key: 'dev-customer-new',
    phone: '0500000005',
    role: 'development customer with an incomplete profile',
  },
  {
    key: 'dev-all-panels',
    phone: '0500000006',
    role: 'development account with every staff panel (admin, vendor, kitchen)',
  },
  {
    key: 'owner-wadi',
    phone: '0500000011',
    role: 'owner of Al Wadi Livestock Farm',
  },
  {
    key: 'owner-najd',
    phone: '0500000012',
    role: 'owner of Najd Carcasses',
  },
  {
    key: 'owner-souq',
    phone: '0500000013',
    role: 'owner of Old Souq Butchery (suspended)',
  },
  {
    key: 'applicant-pending',
    phone: '0500000021',
    role: 'applicant waiting for review',
  },
  {
    key: 'applicant-rejected',
    phone: '0500000022',
    role: 'applicant whose application was rejected',
  },
  { key: 'customer-1', phone: '0500000031', role: 'customer' },
  { key: 'customer-2', phone: '0500000032', role: 'customer' },
  { key: 'customer-3', phone: '0500000033', role: 'customer' },
];
