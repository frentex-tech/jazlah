import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const dev = process.env.NODE_ENV !== 'production';
// Third-party origins the pages load: the map tile host (maps), and the media hosts in MEDIA_ORIGINS (space-separated:
// the storage that presigned uploads POST to, and the public CDN of logos and covers).
const tiles = new URL((process.env.NEXT_PUBLIC_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png').replace(/[{}]/g, '')).origin;
const origin = (o: string) => {
  try {
    return new URL(o).origin;
  } catch {
    throw new Error(`MEDIA_ORIGINS: "${o}" is not an origin such as https://cdn.example.com (space-separated list).`);
  }
};
const media = (process.env.MEDIA_ORIGINS ?? '').split(/\s+/).filter(Boolean).map(origin).join(' ');
// A test build (the Playwright mock suite only): mocks allowed, uploads on the mock storage of our own origin. Inlined
// into the bundles (`env` below), so it is fixed when the image is built and no runtime variable can change it.
const testBuild = process.env.DASHBOARD_TEST_BUILD === '1';
// A deploy refuses to build or start with DASHBOARD_TEST_BUILD or DASHBOARD_API_MOCK set: scripts/deploy-guard.sh.

// Staff panel: never framed (clickjacking on approvals, deletes, payouts), no third-party scripts.
// shortcut: script-src allows 'unsafe-inline' because Next's bootstrap scripts are inline; move to per-request nonces
// (middleware) before launch or once a page shows user-written HTML (#145).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${tiles} ${media}`.trim(),
  `connect-src 'self' ${tiles} ${media}${dev ? ' ws:' : ''}`.replace(/\s+/g, ' '),
  "font-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // HSTS for this host only (subdomains are the edge team's call). Never on plain-http local dev.
  ...(dev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['@phosphor-icons/react'] },
  // Always defined, so `process.env.DASHBOARD_TEST_BUILD` is a constant everywhere and a production build drops the mocks.
  env: { DASHBOARD_TEST_BUILD: testBuild ? '1' : '' },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

// Without MEDIA_ORIGINS the CSP blocks every upload and every logo or cover: a production build refuses to go on,
// except a test build (DASHBOARD_TEST_BUILD=1, the mock suite), which uploads to the mock storage on our own origin.
// The CSP is fixed at build time, so each environment (staging, production) gets its own build (README).
export default function nextConfig(phase: string) {
  if (phase === PHASE_PRODUCTION_BUILD && !media && !testBuild) {
    throw new Error('MEDIA_ORIGINS is empty: set the storage and CDN origins (see .env.example), or DASHBOARD_TEST_BUILD=1 for the mock test build.');
  }
  return withNextIntl(config);
}
