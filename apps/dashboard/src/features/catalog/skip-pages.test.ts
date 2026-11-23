// Self-check, run with: node --experimental-strip-types src/features/catalog/skip-pages.test.ts
import assert from 'node:assert/strict';
import { firstKeptPage } from './skip-pages.ts';

// Pages of vendor ids; 'J' is JAZLA (dropped). Cursor = index of the page.
const pages = [['J', 'J'], ['J'], ['v1', 'J'], ['v2']];
const get = async (c: string | null | undefined) => ({ items: pages[Number(c ?? 0)]!, nextCursor: Number(c ?? 0) + 1 < pages.length ? String(Number(c ?? 0) + 1) : null });
const vendor = (x: string) => x !== 'J';

assert.deepEqual(await firstKeptPage(get, undefined, vendor), { items: ['v1'], nextCursor: '3' }); // skips two empty pages
assert.deepEqual(await firstKeptPage(get, undefined, vendor, 2), { items: [], nextCursor: '2' }); // capped: «next» goes on
assert.deepEqual(await firstKeptPage(get, '3', vendor), { items: ['v2'], nextCursor: null });
console.log('skip-pages: ok');
