import type { components } from '../src/api/schema';

// Bodies of the contract (openapi.json), typed by schema.d.ts: a renamed or missing field fails the typecheck.
type S = components['schemas'];

const riyadh = (days = 0) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date(Date.now() + days * 86_400_000));
export { riyadh };

export const settings = (over: Partial<S['OperationsSettingsResponseDto']> = {}): S['OperationsSettingsResponseDto'] => ({
  deliveryWindow: { start: '16:00', end: '18:00' },
  cutoffs: {
    readyMeat: { time: '12:00', leadDays: 0 },
    carcass: { time: '20:00', leadDays: 1 },
    cooked: { time: '18:00', leadDays: 1 },
    occasion: { time: null, leadDays: 3 },
    adha: { time: null, leadDays: 3 },
  },
  defaultCapacity: { ordersPerDay: 40, carcassesPerDay: 10 },
  cod: { enabled: true, maxOrderHalalas: 150000, allowedOrderTypes: ['ready_meat', 'adha'], confirmation: 'review' },
  bookingHorizonDays: 14,
  minOrderHalalas: 10000,
  deliveryFeeHalalas: 1500,
  complaintWindowHours: 48,
  closedDays: [{ date: riyadh(3), scope: 'both', reasonAr: 'إجازة اليوم الوطني', reasonEn: 'National Day holiday' }],
  paused: { isPaused: false, messageAr: null, messageEn: null },
  updatedAt: '2026-11-23T08:00:00.000Z',
  ...over,
});

export const clientSettings = (paused: S['OrderingPauseResponseDto'] = { isPaused: false, messageAr: null, messageEn: null }): S['ClientSettingsResponseDto'] => ({
  deliveryWindow: { start: '16:00', end: '18:00' },
  bookingHorizonDays: 14,
  minOrderHalalas: 10000,
  deliveryFeeHalalas: 1500,
  codEnabled: true,
  codMaxOrderHalalas: 150000,
  paused,
});

export const VENDOR_ID = '6f1c1b1e-1111-4111-8111-000000000001';
export const capacity = (over: Partial<S['VendorCapacityResponseDto']> = {}): S['VendorCapacityResponseDto'] => ({
  vendorId: VENDOR_ID,
  ordersPerDay: null,
  carcassesPerDay: null,
  days: [],
  ...over,
});

export const vendor = (over: Partial<S['AdminVendorResponseDto']> = {}): S['AdminVendorResponseDto'] => ({
  id: VENDOR_ID,
  name: { ar: 'مجازر الفلاح', en: 'Al Falah Butchery' },
  description: { ar: null, en: null },
  logoUrl: null,
  coverUrl: null,
  city: 'الرياض',
  commissionBasisPoints: 1250,
  commercialRegistrationNumber: '1010101010',
  vatNumber: null,
  contactPhone: '+966500000002',
  contactEmail: null,
  ibanMasked: null,
  accountHolderName: null,
  location: { latitude: 24.71, longitude: 46.67 },
  createdAt: '2026-11-01T08:00:00.000Z',
  isPlatform: false,
  status: 'active',
  suspendedAt: null,
  suspensionReason: null,
  applicationId: null,
  ...over,
});

const orderVendor: S['OrderVendorResponseDto'] = { id: VENDOR_ID, name: { ar: 'مجازر الفلاح', en: 'Al Falah Butchery' }, phone: '+966500000002', location: { latitude: 24.71, longitude: 46.67 }, city: 'الرياض' };

export const ORDER_ID = '0a0a0a0a-2222-4222-8222-000000000001';
export const summary = (over: Partial<S['OrderSummaryResponseDto']> = {}): S['OrderSummaryResponseDto'] => ({
  id: ORDER_ID,
  number: 'JZ-261123-0001',
  status: 'new',
  orderType: 'ready_meat',
  fulfilment: 'delivery',
  fulfilmentDate: riyadh(1),
  vendor: orderVendor,
  customer: { id: '0b0b0b0b-3333-4333-8333-000000000001', name: 'سعد العتيبي', phone: '+966551234567' },
  paymentMethod: 'cod',
  totalHalalas: 19300,
  createdAt: '2026-11-23T07:00:00.000Z',
  ...over,
});

export const order = (over: Partial<S['OrderResponseDto']> = {}): S['OrderResponseDto'] => ({
  ...summary(),
  items: [
    {
      id: '0c0c0c0c-4444-4444-8444-000000000001',
      productId: '0d0d0d0d-5555-4555-8555-000000000001',
      name: { ar: 'ريب آي بقري طازج', en: 'Fresh beef ribeye' },
      imageUrl: null,
      size: { id: '0e0e0e0e-6666-4666-8666-000000000001', approxWeightGrams: 500, tag: null },
      cutting: { id: '0f0f0f0f-7777-4777-8777-000000000001', name: { ar: 'ستيك', en: 'Steak' } },
      packaging: 'vacuum',
      exclusions: [{ id: '10101010-8888-4888-8888-000000000001', name: { ar: 'الدهن', en: 'Fat' } }],
      notes: null,
      quantity: 2,
      unitPriceHalalas: 8900,
      totalHalalas: 17800,
    },
  ],
  address: {
    label: 'المنزل',
    location: { latitude: 24.8125, longitude: 46.6114 },
    city: 'الرياض',
    district: 'حي الملقا',
    street: 'شارع أنس بن مالك',
    building: '12',
    shortNationalAddress: null,
    driverInstructions: 'البوابة الثانية',
  },
  pickupPoint: null,
  window: { start: '16:00', end: '18:00' },
  subtotalHalalas: 17800,
  discountHalalas: 0,
  deliveryFeeHalalas: 1500,
  vatHalalas: 2517,
  couponCode: null,
  notes: null,
  cancelReason: null,
  expiresAt: null,
  payment: { method: 'cod', status: null, paymentId: null, walletHalalas: 0, walletRestoredHalalas: 0, cardLast4: null },
  refunds: [],
  history: [{ from: null, to: 'new', actorType: 'customer', note: null, at: '2026-11-23T07:00:00.000Z' }],
  allowedTransitions: ['confirmed', 'cancelled'],
  ...over,
});

export const COUPON_ID = '20202020-9999-4999-8999-000000000001';
export const coupon = (over: Partial<S['CouponResponseDto']> = {}): S['CouponResponseDto'] => ({
  id: COUPON_ID,
  code: 'RAMADAN25',
  type: 'percent',
  value: 25,
  maxDiscountHalalas: 5000,
  minOrderHalalas: 10000,
  vendorIds: [],
  categoryIds: [],
  startsAt: '2026-11-20T21:00:00.000Z',
  endsAt: '2027-01-20T21:00:00.000Z',
  usageLimit: 500,
  perUserLimit: 1,
  isActive: true,
  status: 'active',
  usageCount: 132,
  createdAt: '2026-11-19T21:00:00.000Z',
  updatedAt: '2026-11-19T21:00:00.000Z',
  ...over,
});
