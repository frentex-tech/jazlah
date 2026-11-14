/**
 * Lets everything already scheduled with setImmediate run, which includes any event
 * subscriber already dispatched. Used to give a wrongly early delivery the chance to
 * happen, so the order test would catch it.
 */
export function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
