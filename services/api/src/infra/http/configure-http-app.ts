import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { HttpLogger } from 'pino-http';
import { CORS_WILDCARD } from '@config/is-cors-origin';
import { httpConfig } from '@config/http.config';
import type { HttpConfig } from '@config/http-config.type';
import { REQUEST_LOGGER } from '../logger/request-logger.constants';
import { PreRoutingRateLimiter } from '../rate-limit/pre-routing-rate-limiter';
import { setupApiDocs } from '../api-docs/setup-api-docs';
import {
  CORS_EXPOSED_HEADERS,
  GLOBAL_PREFIX,
  JSON_BODY_TYPES,
} from './http.constants';
import { requireJsonBody } from './require-json-body';

/**
 * Sets up the HTTP layer of the application, the same way for `main.ts` and the e2e
 * tests. Call it after creating the app (with `bodyParser: false`) and before `init()`
 * or `listen()`. Middleware runs in the order it is mounted here, before Nest's own
 * middleware, guards and routes:
 *
 * 1. No `x-powered-by` header; trust TRUST_PROXY_HOPS proxies for the client address
 *    (`req.ip`), which the rate limits and the request log use
 *    (.claude/rules/http.md, "Behind a proxy").
 * 2. The request logger: request id and log line, for every request and path, so
 *    everything refused below is logged with its id.
 * 3. helmet with its defaults, on every response, the Swagger page included.
 * 4. CORS for the origins in CORS_ORIGINS; off when the list is empty.
 * 5. The pre-routing rate limit, per client address: unknown routes and malformed
 *    bodies are counted too, and nothing is parsed for a client over the limit.
 * 6. JSON bodies only (415 otherwise), up to REQUEST_BODY_LIMIT_KB (413 above it).
 *    No form parser: a route that needs one enables it explicitly.
 * 7. The global prefix `/v1`, and the API documentation at `/docs` when enabled.
 *
 * The per-route rate limit and every guard run later, inside Nest, so they come after
 * all of this: a future authentication guard can never run before the pre-routing
 * limit (.claude/rules/http.md, "Guard order").
 */
export function configureHttpApp(app: NestExpressApplication): void {
  const config = app.get<HttpConfig>(httpConfig.KEY);

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxyHops);
  app.use(app.get<HttpLogger>(REQUEST_LOGGER));
  app.use(helmet());
  if (config.corsOrigins.length > 0) {
    app.enableCors({
      origin: config.corsOrigins.includes(CORS_WILDCARD)
        ? CORS_WILDCARD
        : [...config.corsOrigins],
      exposedHeaders: [...CORS_EXPOSED_HEADERS],
    });
  }
  app.use(app.get(PreRoutingRateLimiter).handle);
  app.use(requireJsonBody);
  app.useBodyParser('json', {
    limit: `${config.requestBodyLimitKb}kb`,
    type: [...JSON_BODY_TYPES],
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  if (config.apiDocsEnabled) {
    setupApiDocs(app);
  }
}
