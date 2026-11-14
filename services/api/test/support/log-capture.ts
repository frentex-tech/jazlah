import { EventEmitter } from 'node:events';
import { Writable } from 'node:stream';

type LogLine = Record<string, unknown>;

/**
 * A stream the application logger writes to in a test (LOG_DESTINATION), keeping every
 * line. `waitFor` resolves when a matching line has been written, without sleeping.
 */
export class LogCapture {
  readonly lines: LogLine[] = [];
  private readonly written = new EventEmitter();

  readonly stream = new Writable({
    write: (chunk: Buffer, _encoding, done) => {
      for (const text of chunk.toString().split('\n')) {
        if (text.trim() !== '') {
          const line = JSON.parse(text) as LogLine;
          this.lines.push(line);
          this.written.emit('line', line);
        }
      }
      done();
    },
  });

  /** Everything logged so far, as text. */
  text(): string {
    return this.lines.map((line) => JSON.stringify(line)).join('\n');
  }

  waitFor(
    matches: (line: LogLine) => boolean,
    timeoutMs = 10_000,
  ): Promise<LogLine> {
    const found = this.lines.find(matches);
    if (found) {
      return Promise.resolve(found);
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.written.off('line', listener);
        reject(new Error('no matching log line was written'));
      }, timeoutMs);
      const listener = (line: LogLine) => {
        if (matches(line)) {
          clearTimeout(timer);
          this.written.off('line', listener);
          resolve(line);
        }
      };
      this.written.on('line', listener);
    });
  }
}
