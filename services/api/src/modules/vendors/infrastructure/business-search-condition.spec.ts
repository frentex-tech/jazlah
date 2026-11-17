import { businessSearchCondition } from './business-search-condition';

describe('businessSearchCondition', () => {
  it('searches both names case-insensitively and the CR number in Latin digits, escaped', () => {
    expect(businessSearchCondition('١٠_%')).toEqual({
      AND: {
        OR: [
          { nameAr: { contains: '١٠\\_\\%', mode: 'insensitive' } },
          { nameEn: { contains: '١٠\\_\\%', mode: 'insensitive' } },
          { commercialRegistrationNumber: { contains: '10\\_\\%' } },
        ],
      },
    });
  });
});
