import assert from 'node:assert/strict';
import { bpsOf, percentOf } from './types.ts';

assert.equal(bpsOf('8'), 800);
assert.equal(bpsOf('12.5'), 1250);
assert.equal(bpsOf(' 7.25 '), 725);
assert.equal(bpsOf('٨٫٥'), 850);
assert.equal(bpsOf('0'), 0);
assert.equal(bpsOf('100'), 10000);
assert.equal(bpsOf('100.01'), null);
assert.equal(bpsOf('1.234'), null);
assert.equal(bpsOf('-1'), null);
assert.equal(bpsOf(''), null);
assert.equal(bpsOf('abc'), null);
assert.equal(percentOf(750), 7.5);
console.log('admin-vendors types: ok');
