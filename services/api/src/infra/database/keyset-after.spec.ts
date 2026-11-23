import { keysetAfter } from './keyset-after';

describe('keysetAfter', () => {
  it('matches every row on the first page', () => {
    expect(keysetAfter(null)).toEqual({});
  });

  it('matches the rows strictly after the cursor, newest first, with an index bound', () => {
    const createdAt = new Date('2026-11-15T10:00:00.000Z');
    const id = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

    expect(keysetAfter({ createdAt, id })).toEqual({
      createdAt: { lte: createdAt },
      OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }],
    });
  });
});
