import type { Env } from './env.type';

/**
 * The `http` namespace's values, from the validated environment. Separate from the
 * namespace so the rules (when the API documentation is served) can be tested with
 * any environment.
 */
export function buildHttpConfig(env: Env) {
  return {
    /** Unset API_DOCS_ENABLED: on in development and test, off in production. */
    apiDocsEnabled: env.API_DOCS_ENABLED ?? env.NODE_ENV !== 'production',
    /** Empty: CORS is off. May contain `*` outside production. */
    corsOrigins: env.CORS_ORIGINS,
    trustProxyHops: env.TRUST_PROXY_HOPS,
    requestBodyLimitKb: env.REQUEST_BODY_LIMIT_KB,
  };
}
