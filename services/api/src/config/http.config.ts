import { registerAs } from '@nestjs/config';
import { buildHttpConfig } from './build-http-config';
import { loadEnv } from './load-env';

/**
 * The `http` namespace: how the HTTP server is set up (API documentation, CORS, trusted
 * proxies, body size). Inject with `@Inject(httpConfig.KEY) config: HttpConfig`, or
 * read it with `app.get<HttpConfig>(httpConfig.KEY)`.
 */
export const httpConfig = registerAs('http', () => buildHttpConfig(loadEnv()));
