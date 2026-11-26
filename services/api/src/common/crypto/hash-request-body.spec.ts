import { hashRequestBody } from './hash-request-body';

describe('hashRequestBody', () => {
  it('is the same for the same content in another key order, at every depth', () => {
    expect(hashRequestBody({ a: 1, b: { c: 2, d: [1, 2] } })).toBe(
      hashRequestBody({ b: { d: [1, 2], c: 2 }, a: 1 }),
    );
  });

  it('leaves out a key whose value is undefined', () => {
    expect(hashRequestBody({ a: 1, b: undefined })).toBe(
      hashRequestBody({ a: 1 }),
    );
  });

  it('differs when a value differs', () => {
    expect(hashRequestBody({ paymentMethod: 'cod' })).not.toBe(
      hashRequestBody({ paymentMethod: 'mada' }),
    );
  });

  it('differs when a field is added, or null instead of missing', () => {
    expect(hashRequestBody({ a: 1, notes: 'x' })).not.toBe(
      hashRequestBody({ a: 1 }),
    );
    expect(hashRequestBody({ a: 1, notes: null })).not.toBe(
      hashRequestBody({ a: 1 }),
    );
  });

  it('keeps the order of an array', () => {
    expect(hashRequestBody({ a: [1, 2] })).not.toBe(
      hashRequestBody({ a: [2, 1] }),
    );
  });

  it('is a SHA-256 in hex', () => {
    expect(hashRequestBody({})).toMatch(/^[0-9a-f]{64}$/);
  });
});
