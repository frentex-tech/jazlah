import type { Audience } from './audience.type';

/** What a route prefix says about who may call it: anyone (`public`), or one audience. */
export type RouteAudience = Audience | 'public';
