import createClient from 'openapi-fetch';
import type { components, paths } from './schema';

export type ErrorResponse = components['schemas']['ErrorResponseDto'];
export type Schemas = components['schemas'];

/** Typed API client (docs/frontend/client-generation.md). Server-side only: tokens live in HTTP-only cookies. */
export const api = createClient<paths>({ baseUrl: process.env.API_URL ?? 'http://localhost:3000' });
