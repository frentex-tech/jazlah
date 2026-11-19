// Self-check, run with: node --experimental-strip-types src/lib/auth/request.test.ts
import assert from 'node:assert/strict';
import { clientIpFrom } from './request.ts';

const h = (o: Record<string, string>) => new Headers(o);
// A client-supplied first hop is never trusted.
assert.equal(clientIpFrom(h({ 'x-forwarded-for': '6.6.6.6, 10.0.0.1' }), 'x-forwarded-for'), '10.0.0.1');
assert.equal(clientIpFrom(h({ 'x-forwarded-for': '6.6.6.6', 'x-real-ip': '203.0.113.7' }), 'x-real-ip'), '203.0.113.7');
// No header configured: nothing forwarded, whatever the client sends.
assert.equal(clientIpFrom(h({ 'x-forwarded-for': '6.6.6.6', 'x-real-ip': '6.6.6.6' }), undefined), undefined);
// Not an address: dropped.
assert.equal(clientIpFrom(h({ 'x-real-ip': 'unknown, <script>' }), 'x-real-ip'), undefined);
assert.equal(clientIpFrom(h({ 'x-real-ip': '2001:db8::1' }), 'x-real-ip'), '2001:db8::1');
console.log('request: ok');
