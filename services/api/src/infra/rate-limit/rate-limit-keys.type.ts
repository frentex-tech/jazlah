/** The Redis keys of one rate limit counter (rateLimitKeys). */
export type RateLimitKeys = Readonly<{ hits: string; blocked: string }>;
