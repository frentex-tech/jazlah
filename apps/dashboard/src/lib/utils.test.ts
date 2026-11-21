// Self-check, run with: node --experimental-strip-types src/lib/utils.test.ts
import assert from 'node:assert/strict';
import { cn } from './utils.ts';

assert.equal(cn('rounded-pill', 'rounded-md'), 'rounded-md'); // skeletons take the Figma r18
assert.equal(cn('px-s32', 'px-s24'), 'px-s24');
assert.equal(cn('gap-s8', 'gap-s16'), 'gap-s16');
assert.equal(cn('shadow-card', 'shadow-none'), 'shadow-none');
assert.equal(cn('text-ink', 'text-h1'), 'text-ink text-h1');
assert.equal(cn('text-body-m', 'text-h1'), 'text-h1');
console.log('utils: ok');
