// Self-check, run with: node --experimental-strip-types src/features/coverage/geo.test.ts
import assert from 'node:assert/strict';
import { isValidPolygon, pointInPolygon, type Polygon } from './geo.ts';

// A square over central Riyadh.
const riyadh: Polygon = { type: 'Polygon', coordinates: [[[46.6, 24.6], [46.8, 24.6], [46.8, 24.8], [46.6, 24.8], [46.6, 24.6]]] };
assert.equal(pointInPolygon([46.7, 24.7], riyadh), true);
assert.equal(pointInPolygon([46.9, 24.7], riyadh), false);
assert.equal(pointInPolygon([46.6, 24.7], riyadh), true); // on the edge
assert.equal(pointInPolygon([39.2, 21.5], riyadh), false); // Jeddah
assert.equal(isValidPolygon(riyadh), true);
assert.equal(isValidPolygon({ type: 'Polygon', coordinates: [[[46.6, 24.6], [46.8, 24.6], [46.6, 24.6]]] }), false);
assert.equal(isValidPolygon({ type: 'Polygon', coordinates: [[[46.6, 24.6], [46.8, 24.6], [46.8, 24.8]]] }), false); // not closed
const bowTie: Polygon = { type: 'Polygon', coordinates: [[[46.6, 24.6], [46.8, 24.8], [46.8, 24.6], [46.6, 24.8], [46.6, 24.6]]] };
assert.equal(isValidPolygon(bowTie), false);
console.log('geo: ok');
