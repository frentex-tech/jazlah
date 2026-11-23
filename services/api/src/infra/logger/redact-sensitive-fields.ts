import { EventEmitter } from 'node:events';
import { isSensitiveField } from './is-sensitive-field';

/** What a sensitive value is replaced with. */
const CENSOR = '[REDACTED]';

/** How deep into nested objects fields are checked. Deeper values are replaced. */
const MAX_DEPTH = 20;

/**
 * A copy of a log line's fields with the value of every secret-like field
 * (`isSensitiveField`) replaced by `[REDACTED]`, at any depth, in objects and arrays.
 * Applied to every log line (`formatters.log` in `createLoggerParams`), before the
 * serializers.
 *
 * pino's own `redact` matches exact paths only, case-sensitively, one wildcard level
 * at a time, so it cannot catch `newPassword` or `Authorization` at any depth: this
 * walk replaces it.
 *
 * Errors, streams and other event emitters (the raw request and response pino-http
 * logs) are left as they are: the `err`, `req` and `res` serializers reduce those to
 * allowlisted fields. Class instances (a DTO) are copied field by field and checked.
 */
export function redactSensitiveFields(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  return redactObject(fields, 0, new WeakSet());
}

function redactValue(
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
): unknown {
  if (typeof value !== 'object' || value === null || isOpaque(value)) {
    return value;
  }
  if (depth >= MAX_DEPTH) {
    return '[TOO DEEP]';
  }
  if (seen.has(value)) {
    return '[CIRCULAR]';
  }
  seen.add(value);
  const result = Array.isArray(value)
    ? value.map((item: unknown) => redactValue(item, depth + 1, seen))
    : redactObject(value, depth, seen);
  seen.delete(value);
  return result;
}

function redactObject(
  value: object,
  depth: number,
  seen: WeakSet<object>,
): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    copy[key] = isSensitiveField(key)
      ? CENSOR
      : redactValue(child, depth + 1, seen);
  }
  return copy;
}

/** Objects that are not data: handled by a serializer, or stringified by pino as is. */
function isOpaque(value: object): boolean {
  return (
    value instanceof Error ||
    value instanceof EventEmitter ||
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    ArrayBuffer.isView(value) ||
    typeof Reflect.get(value, 'toJSON') === 'function'
  );
}
