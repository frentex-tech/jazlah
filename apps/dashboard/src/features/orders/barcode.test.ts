import assert from 'node:assert/strict';
import { code39 } from './barcode.ts';

// Every Code 39 character is 9 elements (5 bars, 4 spaces), 3 of them wide, starting and ending with a bar.
const runs = (bits: string) => bits.match(/1+|0+/g)!.map((r) => r.length);
const one = (c: string) => code39(c)!.slice(13, 25);
const seen = new Set<string>();
for (const c of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-') {
  const r = runs(one(c));
  assert.equal(r.length, 9, c);
  assert.equal(r.filter((n) => n === 2).length, 3, c);
  assert.ok(r.every((n) => n === 1 || n === 2), c);
  assert.ok(!seen.has(one(c)), `${c} is unique`);
  seen.add(one(c));
}
assert.equal(code39('JZ-261110-0482')!.length, 16 * 13 - 1);
assert.equal(code39('jz')!.length, code39('JZ')!.length);
assert.equal(code39('#1'), null);
