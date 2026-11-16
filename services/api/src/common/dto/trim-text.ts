/** A `@Transform` for text fields: surrounding spaces removed; other values unchanged. */
export function trimText({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
