/**
 * Whether a package can be loaded from here. Used to choose optional tooling (such
 * as pino-pretty, a dev dependency) only when it is installed.
 */
export function isModuleResolvable(name: string): boolean {
  try {
    require.resolve(name);
    return true;
  } catch {
    // Not installed: the caller falls back to what it can use without it.
    return false;
  }
}
