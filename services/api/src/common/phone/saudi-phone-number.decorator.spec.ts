import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaudiPhoneNumber } from './saudi-phone-number.decorator';

class ContactDto {
  @SaudiPhoneNumber()
  phone!: string;
}

async function check(phone: unknown) {
  const dto = plainToInstance(ContactDto, { phone });
  return { dto, errors: await validate(dto) };
}

describe('SaudiPhoneNumber', () => {
  it.each([
    ['0512345678', '+966512345678'],
    ['٠٥١٢٣٤٥٦٧٨', '+966512345678'],
    ['011 234 5678', '+966112345678'],
    ['+966 12 345 6789', '+966123456789'],
  ])('accepts %s and leaves it in E.164', async (input, e164) => {
    const { dto, errors } = await check(input);

    expect(errors).toEqual([]);
    expect(dto.phone).toBe(e164);
  });

  it.each([
    ['an unknown area code', '0152345678'],
    ['another country', '+971501234567'],
    ['a number', 512345678],
    ['nothing', undefined],
  ])('refuses %s with the constraint isSaudiPhoneNumber', async (_l, input) => {
    const { errors } = await check(input);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints).toHaveProperty('isSaudiPhoneNumber');
  });
});
