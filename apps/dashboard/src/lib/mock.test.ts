// Self-check, run with: node --experimental-strip-types src/lib/mock.test.ts
import assert from 'node:assert/strict';
import { mocksEnabled } from './mock.ts';

const env = process.env as Record<string, string | undefined>;
console.warn = () => {};
env.DASHBOARD_API_MOCK = '1';
env.NODE_ENV = 'production';
delete env.PLAYWRIGHT;
assert.equal(mocksEnabled(), false); // a production server never signs anyone in with the mock codes
env.PLAYWRIGHT = '1';
assert.equal(mocksEnabled(), true);
env.NODE_ENV = 'development';
delete env.PLAYWRIGHT;
assert.equal(mocksEnabled(), true);
env.DASHBOARD_API_MOCK = '0';
assert.equal(mocksEnabled(), false);
console.log('mock: ok');
