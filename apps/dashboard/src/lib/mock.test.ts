// Self-check, run with: node --experimental-strip-types src/lib/mock.test.ts
// (At runtime here; in a Next build NODE_ENV and DASHBOARD_TEST_BUILD are fixed when the image is built.)
import assert from 'node:assert/strict';
import { mocksEnabled } from './mock.ts';

const env = process.env as Record<string, string | undefined>;
console.warn = () => {};
env.DASHBOARD_API_MOCK = '1';
env.NODE_ENV = 'production';
delete env.DASHBOARD_TEST_BUILD;
env.PLAYWRIGHT = '1';
assert.equal(mocksEnabled(), false); // a production image never signs anyone in with the mock codes, PLAYWRIGHT or not
env.DASHBOARD_TEST_BUILD = '1';
assert.equal(mocksEnabled(), true); // only an image built as a test build
env.NODE_ENV = 'development';
delete env.DASHBOARD_TEST_BUILD;
assert.equal(mocksEnabled(), true);
env.DASHBOARD_API_MOCK = '0';
assert.equal(mocksEnabled(), false);
console.log('mock: ok');
