import { plainToInstance } from 'class-transformer';
import { MaxLength, validate } from 'class-validator';
import { CharLength } from './char-length.decorator';

class LabelDto {
  @CharLength(1, 30)
  label!: unknown;
}

class MaxLengthLabelDto {
  @MaxLength(30)
  label!: unknown;
}

async function constraintsOf(
  dto: new () => object,
  label: unknown,
): Promise<string[]> {
  const errors = await validate(plainToInstance(dto, { label }));
  return errors.flatMap((error) => Object.keys(error.constraints ?? {}));
}

describe('CharLength', () => {
  it('accepts the bounds and refuses one past each', async () => {
    expect(await constraintsOf(LabelDto, 'ب')).toEqual([]);
    expect(await constraintsOf(LabelDto, 'ب'.repeat(30))).toEqual([]);
    expect(await constraintsOf(LabelDto, '')).toEqual(['charLength']);
    expect(await constraintsOf(LabelDto, 'ب'.repeat(31))).toEqual([
      'charLength',
    ]);
  });

  it('counts a variation selector, as char_length does, where MaxLength does not', async () => {
    // 29 letters, then U+2764 and U+FE0F: 31 code points.
    const label = `${'ب'.repeat(29)}❤️`;

    expect([...label]).toHaveLength(31);
    expect(await constraintsOf(MaxLengthLabelDto, label)).toEqual([]);
    expect(await constraintsOf(LabelDto, label)).toEqual(['charLength']);
  });

  it('counts a character outside the BMP once, as char_length does', async () => {
    // U+1F600 is two UTF-16 code units and one code point.
    const label = `${'ب'.repeat(29)}\u{1F600}`;

    expect(label).toHaveLength(31);
    expect(await constraintsOf(LabelDto, label)).toEqual([]);
  });

  it('refuses a value that is not a string', async () => {
    expect(await constraintsOf(LabelDto, 12)).toEqual(['charLength']);
    expect(await constraintsOf(LabelDto, undefined)).toEqual(['charLength']);
  });
});
