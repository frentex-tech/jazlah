import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const dev = process.env.NODE_ENV !== 'production';
// Third-party origins the pages load: the map tile host (maps), and the media hosts in MEDIA_ORIGINS (space-separated:
// the storage that presigned uploads POST to, and the public CDN of logos and covers).
const tiles = new URL((process.env.NEXT_PUBLIC_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png').replace(/[{}]/g, '')).origin;
const media = (process.env.MEDIA_ORIGINS ?? '').split(/\s+/).filter(Boolean).map((o) => new URL(o).origin).join(' ');

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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(config);
