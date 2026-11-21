import assert from 'node:assert/strict';
import { halalasOf, sar, sarInput } from './money.ts';

assert.equal(sar(8900, 'ar'), '89.00 ر.س');
assert.equal(sar(150, 'en'), 'SAR 1.50');
assert.equal(halalasOf('45'), 4500);
assert.equal(halalasOf(' 45.5 '), 4550);
assert.equal(halalasOf('٤٥٫٠٠'), 4500);
assert.equal(halalasOf('0'), 0);
assert.equal(halalasOf('0.07'), 7);
assert.equal(halalasOf('1.234'), null);
assert.equal(halalasOf('-1'), null);
assert.equal(halalasOf(''), null);
assert.equal(halalasOf('abc'), null);
assert.equal(sarInput(17000), '170.00');
console.log('money: ok');
