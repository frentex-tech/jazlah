import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import {
  API_DOCS_JSON_PATH,
  API_DOCS_PATH,
  API_TITLE,
} from './api-docs.constants';
import { buildOpenApiDocument } from './build-openapi-document';

/**
 * Serves the Swagger page at `/docs` and the document at `/docs-json`, outside the
 * global prefix. The document is built on the first request. Called by
 * configureHttpApp only when the API documentation is enabled (`http` config).
 */
export function setupApiDocs(app: INestApplication): void {
  SwaggerModule.setup(API_DOCS_PATH, app, () => buildOpenApiDocument(app), {
    jsonDocumentUrl: API_DOCS_JSON_PATH,
    raw: ['json'],
    useGlobalPrefix: false,
    customSiteTitle: `${API_TITLE} documentation`,
  });
}
