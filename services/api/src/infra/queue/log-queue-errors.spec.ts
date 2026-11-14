import { EventEmitter } from 'node:events';
import { logQueueErrors } from './log-queue-errors';

describe('logQueueErrors', () => {
  it('logs each error event at warn with the queue name and the error only', () => {
    const source = Object.assign(new EventEmitter(), { name: 'example-queue' });
    const warn = jest.fn();
    logQueueErrors(source, { warn });
    const error = new Error('connect ECONNREFUSED');

    source.emit('error', error);

    expect(warn).toHaveBeenCalledWith(
      { err: error, queue: 'example-queue' },
      'Queue connection error',
    );
  });

  it('keeps an error event from being unhandled', () => {
    const source = Object.assign(new EventEmitter(), { name: 'example-queue' });
    logQueueErrors(source, { warn: jest.fn() });
    // An EventEmitter without an error listener throws on emit('error').
    expect(() => source.emit('error', new Error('x'))).not.toThrow();
  });
});
