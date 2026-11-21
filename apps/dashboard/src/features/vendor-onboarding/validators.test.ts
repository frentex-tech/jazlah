// Self-check, run with: node --experimental-strip-types src/features/vendor-onboarding/validators.test.ts
import assert from 'node:assert/strict';
import { bankOfIban, formatIban, isCrNumber, isEmail, isSaudiContactPhone, isSaudiIban, isVatNumber, lengthOk } from './validators.ts';

// IBAN: the API's own example, typed with spaces, lower case or Arabic digits; one wrong digit breaks the checksum.
assert.ok(isSaudiIban('SA03 8000 0000 6080 1016 7519'));
assert.ok(isSaudiIban('sa0380000000608010167519'));
assert.ok(isSaudiIban('SA03 8000 ٠٠٠٠ 6080 1016 7519'));
assert.ok(!isSaudiIban('SA03 8000 0000 6080 1016 7518'));
assert.ok(!isSaudiIban('SA03 8000 0000 6080 1016 751')); // 23 characters
assert.ok(!isSaudiIban('GB82 WEST 1234 5698 7654 32')); // valid IBAN, not Saudi
assert.equal(formatIban('sa0380000000608010167519'), 'SA03 8000 0000 6080 1016 7519');
assert.equal(bankOfIban('SA03 8000 0000 6080 1016 7519')?.en, 'Al Rajhi Bank');
assert.equal(bankOfIban('SA03'), null);

// CR: exactly 10 digits, Arabic digits accepted.
assert.ok(isCrNumber('1010458216'));
assert.ok(isCrNumber('١٠١٠٤٥٨٢١٦'));
assert.ok(!isCrNumber('10104582'));
assert.ok(!isCrNumber('101045821a'));

// VAT: 15 digits, first and last 3.
assert.ok(isVatNumber('310123456700003'));
assert.ok(!isVatNumber('210123456700003'));
assert.ok(!isVatNumber('31012345670000'));

// Text lengths count code points after trimming.
assert.ok(lengthOk('  ab ', 2, 100));
assert.ok(!lengthOk(' a ', 2, 100));
assert.ok(lengthOk('', 0, 1000));

assert.ok(isSaudiContactPhone('551234567'));
assert.ok(isSaudiContactPhone('112345678'));
assert.ok(!isSaudiContactPhone('182345678'));
assert.ok(isEmail('orders@alfalah-meat.sa'));
assert.ok(!isEmail('m.alnokhba@'));
console.log('validators: ok');
