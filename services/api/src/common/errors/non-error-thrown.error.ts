/** Longest part of a thrown value written into the message. */
const MAX_DESCRIBED_LENGTH = 200;

/**
 * Something that is not an Error was thrown (`throw 'boom'`, `throw { code: 1 }`). The
 * global filter logs this in its place, so the request log says what was thrown. The
 * message holds a primitive's value, cut to 200 characters, and only the type and the
 * property names of an object, whose values may be anything. Internal: never sent to a
 * client.
 */
export class NonErrorThrownError extends Error {
  constructor(value: unknown) {
    super(`A value that is not an Error was thrown: ${describe(value)}`);
    this.name = 'NonErrorThrownError';
  }
}

function describe(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    const type: unknown = Reflect.get(value, 'constructor');
    const name = typeof type === 'function' ? type.name : 'object';
    return `${name} with properties [${Object.keys(value).join(', ')}]`;
  }
  const text =
    typeof value === 'function' ? `function ${value.name}` : String(value);
  return `${typeof value} ${text.slice(0, MAX_DESCRIBED_LENGTH)}`;
}
