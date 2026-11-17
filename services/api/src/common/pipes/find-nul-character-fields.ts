const NUL = '\u0000';

/**
 * The paths of every string holding a NUL character (`\u0000`) in a request value, in
 * the dotted form of VALIDATION_FAILED details (`sizes.0.tag.ar`). `path` names the
 * value itself: the parameter's name for a single path or query parameter, empty for
 * a whole body or query object. Objects and arrays are walked to any depth (a parsed
 * JSON body or query string has no cycles); other values are ignored.
 *
 * Why: PostgreSQL cannot store a NUL in a text column, so one reaching a query fails
 * there (a 500) instead of being refused as invalid input. The global validation pipe
 * calls this before any DTO is validated.
 */
export function findNulCharacterFields(value: unknown, path = ''): string[] {
  if (typeof value === 'string') {
    return value.includes(NUL) ? [path] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown, index) =>
      findNulCharacterFields(item, join(path, String(index))),
    );
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      findNulCharacterFields(item, join(path, key)),
    );
  }
  return [];
}

function join(parent: string, key: string): string {
  return parent === '' ? key : `${parent}.${key}`;
}
