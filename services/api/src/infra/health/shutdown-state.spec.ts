import { ShutdownState } from './shutdown-state';

describe('ShutdownState', () => {
  it('is draining as soon as SIGTERM arrives, before any shutdown hook', () => {
    const state = new ShutdownState();
    state.onApplicationBootstrap();
    try {
      expect(state.draining).toBe(false);
      process.emit('SIGTERM');
      expect(state.draining).toBe(true);
    } finally {
      state.onApplicationShutdown();
    }
  });

  it('is draining when closed without a signal', () => {
    const state = new ShutdownState();
    state.onModuleDestroy();
    expect(state.draining).toBe(true);
  });

  it('removes its signal listeners on shutdown', () => {
    const before = process.listenerCount('SIGTERM');
    const state = new ShutdownState();
    state.onApplicationBootstrap();
    expect(process.listenerCount('SIGTERM')).toBe(before + 1);
    state.onApplicationShutdown();
    expect(process.listenerCount('SIGTERM')).toBe(before);
  });
});
