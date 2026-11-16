/** A `@Transform` for optional text: trimmed, and blank becomes null (no text). */
export function toOptionalText({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
