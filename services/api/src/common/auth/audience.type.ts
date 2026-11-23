import type { AUDIENCES } from './audiences.constants';

/** One of the audiences a user signs in as. */
export type Audience = (typeof AUDIENCES)[number];
