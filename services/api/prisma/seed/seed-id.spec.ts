import { seedId } from './seed-id';

const VERSION_5_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('seedId', () => {
  it('is a version 5 UUID', () => {
    expect(seedId('category:whole-carcasses')).toMatch(VERSION_5_UUID);
  });

  it('gives the same id for the same name', () => {
    expect(seedId('product:a')).toBe(seedId('product:a'));
  });

  it('gives different ids for different names', () => {
    expect(seedId('product:a')).not.toBe(seedId('product:b'));
  });

  it('does not change between versions of the seed', () => {
    // A changed derivation would create a second copy of every seeded row.
    expect(seedId('category:whole-carcasses')).toBe(
      '6553f367-5fcc-5096-9c09-1dc9cef2bee0',
    );
  });
});
