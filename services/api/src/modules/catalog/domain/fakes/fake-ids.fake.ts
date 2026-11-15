/**
 * Deterministic ids for the in-memory fakes (domain code imports no Node module): each
 * fake has its own `series` (four hex digits), so ids never collide across fakes.
 */
export function fakeIds(series: string): () => string {
  let next = 0;
  return () => {
    next += 1;
    return `00000000-0000-4000-${series}-${String(next).padStart(12, '0')}`;
  };
}
