import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaudiMobileNumber } from './saudi-mobile-number.decorator';

class PhoneDto {
  @SaudiMobileNumber()
  phone!: string;
}

async function check(phone: unknown) {
  const dto = plainToInstance(PhoneDto, { phone });
  return { dto, errors: await validate(dto) };
}

describe('SaudiMobileNumber', () => {
  it.each(['0512345678', '+966 51 234 5678', '٠٥١٢٣٤٥٦٧٨'])(
    'accepts %s and leaves it in E.164',
    async (input) => {
      const { dto, errors } = await check(input);

      expect(errors).toEqual([]);
      expect(dto.phone).toBe('+966512345678');
    },
  );

  it.each([
    ['a landline', '0112345678'],
    ['another country', '+971501234567'],
    ['a number', 512345678],
    ['nothing', undefined],
  ])(
    'refuses %s with the constraint isSaudiMobileNumber',
    async (_l, input) => {
      const { errors } = await check(input);

      expect(errors).toHaveLength(1);
      expect(errors[0]?.constraints).toHaveProperty('isSaudiMobileNumber');
    },
  );
});
