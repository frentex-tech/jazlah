/** The headers in `allowed` (lower-case names), and no other. */
export function pickHeaders(
  headers: unknown,
  allowed: readonly string[],
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  if (typeof headers !== 'object' || headers === null) {
    return picked;
  }
  for (const [name, value] of Object.entries(headers)) {
    if (allowed.includes(name.toLowerCase())) {
      picked[name.toLowerCase()] = value;
    }
  }
  return picked;
}
