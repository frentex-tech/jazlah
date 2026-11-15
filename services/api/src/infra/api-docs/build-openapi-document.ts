import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { BEARER_AUTH_SCHEME } from '@common/decorators/bearer-auth.constants';
import { ErrorResponseDto } from '@common/filters/error-response.dto';
import { GLOBAL_PREFIX } from '../http/http.constants';
import { API_TITLE, API_VERSION } from './api-docs.constants';

/**
 * The OpenAPI document of the application's routes. The app must have the global
 * prefix set (configureHttpApp, or the generator), so every path starts with `/v1`.
 *
 * Used both to serve `/docs` and by `pnpm openapi:generate` to write `openapi.json`,
 * so the two are the same document.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setVersion(API_VERSION)
    .setDescription(
      [
        `Every route is under the /${GLOBAL_PREFIX} prefix; the paths below include it.`,
        'Amounts are integer halalas; timestamps are UTC (ISO 8601).',
        'Every error response has the ErrorResponseDto shape; clients branch on its code.',
      ].join('\n\n'),
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from the authentication endpoints.',
      },
      BEARER_AUTH_SCHEME,
    )
    .build();
  return SwaggerModule.createDocument(app, config, {
    extraModels: [ErrorResponseDto],
  });
}
