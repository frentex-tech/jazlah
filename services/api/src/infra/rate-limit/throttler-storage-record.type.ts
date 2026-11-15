import type { ThrottlerStorage } from '@nestjs/throttler';

/**
 * What a throttler storage returns for one request. @nestjs/throttler declares this as
 * ThrottlerStorageRecord but does not export it from its entry point.
 */
export type ThrottlerStorageRecord = Awaited<
  ReturnType<ThrottlerStorage['increment']>
>;
