/** The parts of an OpenAPI document the e2e tests read. */
export type OpenApiDocument = {
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, { responses: Record<string, unknown> }>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
};
