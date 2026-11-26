import { pickupTermsOf } from './pickup-terms-of';

const WINDOW = { start: '16:00', end: '22:00' };

describe('pickupTermsOf (ASSUMPTION until vendors have hours)', () => {
  it('offers pickup with the delivery window, the store’s name, map point, phone and city, no hours', () => {
    expect(
      pickupTermsOf(
        {
          id: 'v1',
          name: { ar: 'ملحمة', en: 'Butcher' },
          city: 'Riyadh',
          location: { latitude: 24.7, longitude: 46.7 },
          contactPhone: '+966500000001',
        },
        WINDOW,
      ),
    ).toEqual({
      isOffered: true,
      window: WINDOW,
      point: {
        name: { ar: 'ملحمة', en: 'Butcher' },
        address: { ar: 'Riyadh', en: 'Riyadh' },
        location: { latitude: 24.7, longitude: 46.7 },
        phone: '+966500000001',
        hours: null,
      },
    });
  });

  it('leaves out what the store does not have', () => {
    expect(
      pickupTermsOf(
        {
          id: 'v1',
          name: { ar: 'ملحمة', en: 'Butcher' },
          city: null,
          location: null,
          contactPhone: null,
        },
        WINDOW,
      ).point,
    ).toMatchObject({
      address: null,
      location: null,
      phone: null,
      hours: null,
    });
  });
});
