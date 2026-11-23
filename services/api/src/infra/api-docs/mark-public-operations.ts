import type { OpenAPIObject } from '@nestjs/swagger';

const METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

/**
 * Gives every operation that declares no security requirement an explicit empty one
 * (`security: []`), the OpenAPI way of saying "no token": generated clients then send
 * no Authorization header, and readers see it is public on purpose. Protected
 * operations declare the bearer scheme with `@ApiBearerAuth`; the documentation test
 * (`openapi-document.spec.ts`) checks both against the audience prefix of the path.
 */
export function markPublicOperations(document: OpenAPIObject): OpenAPIObject {
  for (const item of Object.values(document.paths)) {
    for (const method of METHODS) {
      const operation = item[method];
      if (operation !== undefined && operation.security === undefined) {
        operation.security = [];
      }
    }
  }
  return document;
}
