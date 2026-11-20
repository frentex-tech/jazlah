// The staff auth calls, behind one interface: the real API (openapi-fetch) or an in-process mock for local
// development and the Playwright smoke tests (DASHBOARD_API_MOCK=1). Edge-safe: fetch only.
import createClient from 'openapi-fetch';
import type { components, paths } from '@/api/schema';
import { mocksEnabled } from '../mock';
import type { Session } from '../session';

type S = components['schemas'];
export type ErrorCode = S['ErrorCode'] | 'NETWORK';
export type SignedIn = S['SignedInResponseDto'];
export type Tokens = S['AuthTokensResponseDto'];
export type OtpRequested = S['OtpRequestedResponseDto'];
/**
 * A refresh refused for one of these means the session is over: sign in again (docs/frontend/errors.md). Anything
 * else (RATE_LIMITED, SERVICE_UNAVAILABLE, NETWORK …) is passing: keep the session and let the user retry.
 */
export const REFRESH_ENDS_SESSION = new Set<string>(['REFRESH_TOKEN_INVALID', 'UNAUTHORIZED', 'ACCOUNT_DISABLED', 'VENDOR_SUSPENDED']);

export type Result<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; retryAfter?: number };

/** `clientIp` is forwarded as X-Forwarded-For, so the API's per-address limits see the user, not the dashboard server. */
export interface AuthBackend {
  requestOtp(phone: string, panel: Session, lang: string, clientIp?: string): Promise<Result<OtpRequested>>;
  verifyOtp(phone: string, panel: Session, code: string, clientIp?: string): Promise<Result<SignedIn>>;
  refresh(refreshToken: string, clientIp?: string): Promise<Result<Tokens>>;
  logout(refreshToken: string, clientIp?: string): Promise<void>;
}

const TIMEOUT_MS = 5000;
const fwd = (ip?: string): Record<string, string> => (ip ? { 'X-Forwarded-For': ip } : {});

function realBackend(baseUrl: string): AuthBackend {
  // A slow API must not hang page loads (the middleware awaits refresh): give up after 5 s, reported as NETWORK.
  const api = createClient<paths>({ baseUrl, fetch: (r: Request) => fetch(r, { signal: AbortSignal.timeout(TIMEOUT_MS) }) });
  const fail = (error: unknown, response?: Response): { ok: false; code: ErrorCode; retryAfter?: number } => ({
    ok: false,
    code: (error as S['ErrorResponseDto'] | undefined)?.code ?? 'NETWORK',
    retryAfter: Number(response?.headers.get('retry-after')) || undefined,
  });
  const call = async <T,>(p: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<Result<T>> => {
    try {
      const { data, error, response } = await p;
      return error || data === undefined ? fail(error, response) : { ok: true, data };
    } catch {
      return { ok: false, code: 'NETWORK' };
    }
  };
  return {
    requestOtp: (phone, panel, lang, ip) =>
      call(api.POST('/v1/public/auth/otp/request', { body: { phone, audience: panel }, headers: { 'Accept-Language': lang, ...fwd(ip) } })),
    verifyOtp: (phone, panel, code, ip) =>
      call(
        api.POST('/v1/public/auth/otp/verify', {
          body: { phone, audience: panel, code, devicePlatform: 'web', deviceName: 'Dashboard' },
          headers: fwd(ip),
        }),
      ),
    refresh: (refreshToken, ip) => call(api.POST('/v1/public/auth/refresh', { body: { refreshToken }, headers: fwd(ip) })),
    logout: async (refreshToken, ip) => {
      await call(api.POST('/v1/public/auth/logout', { body: { refreshToken }, headers: fwd(ip) }));
    },
  };
}

// Mock accounts, like the API's review accounts (docs/frontend/auth.md): the code is the last digit six times.
const MOCK_ACCESS: Record<string, Session[]> = {
  '+966500000002': ['vendor'],
  '+966500000003': ['kitchen'],
  '+966500000004': ['admin'],
  '+966500000009': ['admin', 'vendor', 'kitchen'], // several roles: shows the panel picker
  // +966500000001 is a customer only: every staff sign-in fails like a wrong code
};
// Any phone may sign in as a customer (the API creates the account). The token carries the phone, so the mock
// vendor applications (features/vendor-onboarding/backend.ts) are per applicant: «mock-at-customer-500000001».
const MOCK_DISABLED = '+966500000008';

export const mockBackend: AuthBackend = {
  async requestOtp(phone) {
    if (phone === '+966500000007') return { ok: false, code: 'RATE_LIMITED', retryAfter: 42 };
    return { ok: true, data: { expiresInSeconds: 300, resendAfterSeconds: 30 } };
  },
  async verifyOtp(phone, panel, code) {
    if (phone === MOCK_DISABLED) return { ok: false, code: 'ACCOUNT_DISABLED' };
    if (code === '000000') return { ok: false, code: 'OTP_EXPIRED' };
    const allowed = panel === 'customer' || MOCK_ACCESS[phone]?.includes(panel);
    if (!allowed || code !== phone.slice(-1).repeat(6)) return { ok: false, code: 'OTP_INVALID' };
    const id = panel === 'customer' ? `customer-${phone.slice(-9)}` : panel;
    return {
      ok: true,
      data: {
        accessToken: `mock-at-${id}`,
        accessTokenExpiresInSeconds: 900,
        refreshToken: `mock-rt-${id}-${Date.now()}`,
        refreshTokenExpiresInSeconds: 2_592_000,
        principal: { userId: 'mock-user', phone: `+966 5•• ••• ${phone.slice(-3)}`, audience: panel, organisationId: null, sessionId: 'mock' },
        profileComplete: panel === 'customer' ? false : null,
      },
    };
  },
  async refresh(refreshToken) {
    if (refreshToken === 'mock-rt-disabled') return { ok: false, code: 'ACCOUNT_DISABLED' }; // disabled since sign-in
    if (refreshToken === 'mock-rt-busy') return { ok: false, code: 'SERVICE_UNAVAILABLE' }; // API briefly down
    if (!refreshToken.startsWith('mock-rt-')) return { ok: false, code: 'REFRESH_TOKEN_INVALID' };
    const id = refreshToken.slice('mock-rt-'.length).replace(/-\d+$/, ''); // "admin", "customer-500000001"
    return {
      ok: true,
      data: {
        accessToken: id.startsWith('customer') ? `mock-at-${id}` : 'mock-at',
        accessTokenExpiresInSeconds: 900,
        refreshToken: `mock-rt-${id}-${Date.now()}`,
        refreshTokenExpiresInSeconds: 2_592_000,
      },
    };
  },
  async logout() {},
};

export function authBackend(): AuthBackend {
  return mocksEnabled() ? mockBackend : realBackend(process.env.API_URL ?? 'http://localhost:3000');
}
