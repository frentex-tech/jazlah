import { findNulCharacterFields } from './find-nul-character-fields';

describe('findNulCharacterFields', () => {
  it('finds nothing in values without a NUL', () => {
    expect(
      findNulCharacterFields({
        name: { ar: 'نعيمي', en: 'Naimi' },
        sizes: [{ priceHalalas: 50000, tag: null }],
        isAvailable: true,
      }),
    ).toEqual([]);
  });

  it('names a NUL anywhere in a string, by its dotted path', () => {
    expect(
      findNulCharacterFields({
        fullName: '\u0000سارة',
        name: { ar: 'نعيمي', en: 'Naimi\u0000' },
        sizes: [{ tag: { ar: 'عقيقة', en: 'for\u0000 aqiqah' } }],
        imageMediaIds: ['a', 'b\u0000'],
      }),
    ).toEqual(['fullName', 'name.en', 'sizes.0.tag.en', 'imageMediaIds.1']);
  });

  it('names a single parameter by the path it is given', () => {
    expect(findNulCharacterFields('a\u0000b', 'id')).toEqual(['id']);
    expect(findNulCharacterFields('ab', 'id')).toEqual([]);
  });

  it('ignores numbers, booleans and null, and the code point written as text', () => {
    expect(
      findNulCharacterFields({ a: 0, b: false, c: null, d: '\\u0000' }),
    ).toEqual([]);
  });
});
