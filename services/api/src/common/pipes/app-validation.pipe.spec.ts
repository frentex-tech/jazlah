import type { ArgumentMetadata } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { AppValidationPipe } from './app-validation.pipe';

class NameDto {
  @IsString()
  @MaxLength(5)
  name!: string;
}

const body: ArgumentMetadata = { type: 'body', metatype: NameDto };

/** What the pipe throws for `value`, or `undefined` when it accepts it. */
async function refusal(
  value: unknown,
  metadata: ArgumentMetadata,
): Promise<AppError | undefined> {
  try {
    await new AppValidationPipe().transform(value, metadata);
    return undefined;
  } catch (error) {
    if (error instanceof AppError) {
      return error;
    }
    throw error;
  }
}

describe('AppValidationPipe', () => {
  it('validates a DTO as before', async () => {
    await expect(
      new AppValidationPipe().transform({ name: 'سارة' }, body),
    ).resolves.toEqual({ name: 'سارة' });
    const error = await refusal({ name: 'سارة القحطاني' }, body);
    expect(error?.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error?.details).toEqual([
      { field: 'name', constraints: ['maxLength'] },
    ]);
  });

  it('refuses a NUL in a body field before the DTO is validated', async () => {
    // Too long as well: only the NUL is reported, since nothing else was checked.
    const error = await refusal({ name: 'سارة\u0000 القحطاني' }, body);

    expect(error?.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error?.details).toEqual([
      { field: 'name', constraints: ['hasNoNulCharacter'] },
    ]);
  });

  it('refuses a NUL in a query object, a query parameter and a path parameter', async () => {
    const query = await refusal(
      { cursor: '\u0000', limit: '20' },
      { type: 'query' },
    );
    const single = await refusal('a\u0000', { type: 'query', data: 'q' });
    const param = await refusal('\u0000', { type: 'param', data: 'id' });

    expect([query?.details, single?.details, param?.details]).toEqual([
      [{ field: 'cursor', constraints: ['hasNoNulCharacter'] }],
      [{ field: 'q', constraints: ['hasNoNulCharacter'] }],
      [{ field: 'id', constraints: ['hasNoNulCharacter'] }],
    ]);
  });

  it('refuses it without a DTO too', async () => {
    const error = await refusal(
      { anything: ['ok', 'not\u0000ok'] },
      { type: 'body' },
    );

    expect(error?.details).toEqual([
      { field: 'anything.1', constraints: ['hasNoNulCharacter'] },
    ]);
  });

  it('leaves values of custom decorators alone', async () => {
    const user = { name: 'not input\u0000' };

    await expect(
      new AppValidationPipe().transform(user, { type: 'custom' }),
    ).resolves.toBe(user);
  });
});
