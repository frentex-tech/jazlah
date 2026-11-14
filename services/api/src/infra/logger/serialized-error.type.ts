/** An error as it appears in a log line (`serializeError`). Nothing else is logged. */
export type SerializedError = {
  type: string;
  message: string;
  code?: string | number;
  /** The Prisma model of a Prisma error, when Prisma names one. */
  model?: string;
  stack?: string;
  cause?: SerializedError;
};
