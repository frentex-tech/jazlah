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
import { API_TAGS } from './api-tags.constants';
import { markPublicOperations } from './mark-public-operations';

/**
 * The OpenAPI document of the application's routes. The app must have the global
 * prefix set (configureHttpApp, or the generator), so every path starts with `/v1`.
 *
 * Used both to serve `/docs` and by `pnpm openapi:generate` to write `openapi.json`,
 * so the two are the same document. The tags are listed in the order of API_TAGS, and
 * every operation without a security requirement is marked public (`security: []`).
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const builder = new DocumentBuilder()
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
    );
  for (const tag of Object.values(API_TAGS)) {
    builder.addTag(tag.name, tag.description);
  }
  return markPublicOperations(
    SwaggerModule.createDocument(app, builder.build(), {
      extraModels: [ErrorResponseDto],
      // Tags come only from API_TAGS: a controller whose methods carry their own tags
      // would otherwise also get one made from its class name.
      autoTagControllers: false,
    }),
  );
}
