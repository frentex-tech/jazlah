// Self-check, run with: node --experimental-strip-types src/lib/phone.test.ts
import assert from 'node:assert/strict';
import { formatNational, nationalDigits, toE164 } from './phone.ts';

assert.equal(toE164('0551234567'), '+966551234567');
assert.equal(toE164('55 123 4567'), '+966551234567');
assert.equal(toE164('+966 55 123 4567'), '+966551234567');
assert.equal(toE164('٠٥٥١٢٣٤٥٦٧'), '+966551234567');
assert.equal(toE164('۰۵۵۱۲۳۴۵۶۷'), '+966551234567');
assert.equal(toE164('0451234567'), null); // not a mobile
assert.equal(toE164('55123'), null);
assert.equal(nationalDigits('05512345678999'), '551234567');
assert.equal(formatNational('551234567'), '55 123 4567');
assert.equal(formatNational('5512'), '55 12');
console.log('phone: ok');
