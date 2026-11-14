import { closingResources } from './closing-resources.storage';

/**
 * Runs `close` with `name` recorded as closing until it settles, so the shutdown
 * deadline can name it if it never does.
 */
export async function trackClosing<T>(
  name: string,
  close: () => Promise<T>,
): Promise<T> {
  const done = closingResources.begin(name);
  try {
    return await close();
  } finally {
    done();
  }
}
