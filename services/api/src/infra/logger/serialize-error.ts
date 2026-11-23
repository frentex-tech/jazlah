import {
  PRISMA_ERROR_NAME_PREFIX,
  PRISMA_MESSAGE_OMITTED,
} from './prisma-error-logging.constants';
import type { SerializedError } from './serialized-error.type';

/** How many `cause` levels are followed. */
const MAX_CAUSE_DEPTH = 5;

/**
 * The one serializer for errors in every log line (the `err` key, set in
 * `createLoggerParams`). It keeps an error's name (as `type`, pino's name for it),
 * message, code and stack, and its `cause` through this same serializer, and drops
 * every other property.
 *
 * Why an allowlist: libraries attach whatever they hold to their errors. ioredis puts
 * the failed command on `err.command`, so a failed AUTH carries the Redis password;
 * Prisma puts the driver error on `err.meta`, whose `detail` can hold a whole row
 * ("Failing row contains (...)") with phone numbers and addresses. Any property not
 * named here never reaches a log.
 *
 * A Prisma error's message is not kept either: a validation error prints the query
 * with its argument values (a phone number, an address), and other Prisma messages
 * quote the database's text. For a Prisma error the line holds its class name, its
 * code (P2002...), the model when Prisma names one (`model`), a fixed message and the
 * stack frames without the message.
 *
 * Under pino-http, the value arrives already passed through pino's standard error
 * serializer, which keeps the original error as `raw`; that original is read.
 */
export function serializeError(value: unknown, depth = 0): SerializedError {
  const error = original(value);
  if (!isErrorLike(error)) {
    return { type: typeof error, message: String(error) };
  }
  const code: unknown = Reflect.get(error, 'code');
  const cause: unknown = Reflect.get(error, 'cause');
  const prisma = isPrismaError(error);
  const model = prisma ? modelName(error) : undefined;
  return {
    type: error.name,
    message: prisma ? PRISMA_MESSAGE_OMITTED : error.message,
    ...(typeof code === 'string' || typeof code === 'number' ? { code } : {}),
    ...(model === undefined ? {} : { model }),
    ...(typeof error.stack === 'string'
      ? { stack: prisma ? stackFramesOnly(error.stack) : error.stack }
      : {}),
    ...(cause !== undefined && depth < MAX_CAUSE_DEPTH
      ? { cause: serializeError(cause, depth + 1) }
      : {}),
  };
}

/**
 * Prisma's error classes (PrismaClientKnownRequestError, PrismaClientValidationError and
 * the others), by name, so errors from another realm or a second copy of the client
 * match too.
 */
function isPrismaError(error: Error): boolean {
  return error.name.startsWith(PRISMA_ERROR_NAME_PREFIX);
}

/** The model a Prisma error names (`meta.modelName`), when it is a plain name. */
function modelName(error: Error): string | undefined {
  const meta: unknown = Reflect.get(error, 'meta');
  if (typeof meta !== 'object' || meta === null) {
    return undefined;
  }
  const name: unknown = Reflect.get(meta, 'modelName');
  return typeof name === 'string' && /^\w{1,64}$/.test(name) ? name : undefined;
}

/**
 * The stack's `at ...` lines only. A stack starts with the error's name and message,
 * so keeping it whole would bring back the message just removed.
 */
function stackFramesOnly(stack: string): string {
  return stack
    .split('\n')
    .filter((line) => /^\s+at /.test(line))
    .join('\n');
}

function original(value: unknown): unknown {
  if (typeof value === 'object' && value !== null) {
    const raw: unknown = Reflect.get(value, 'raw');
    if (isErrorLike(raw)) {
      return raw;
    }
  }
  return value;
}

/**
 * An Error, also one from another realm (Jest runs tests in a separate VM context, so
 * `instanceof Error` can be false for a real error).
 */
function isErrorLike(value: unknown): value is Error {
  return (
    value instanceof Error ||
    (typeof value === 'object' &&
      value !== null &&
      typeof Reflect.get(value, 'message') === 'string' &&
      typeof Reflect.get(value, 'name') === 'string')
  );
}
