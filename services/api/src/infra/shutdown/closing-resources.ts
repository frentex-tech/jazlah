/**
 * The resources that have begun to close and have not finished, by name. When the
 * shutdown deadline passes, `closeWithDeadline` logs these names, so the log says
 * what held the shutdown. A resource calls `begin(name)` as its close starts and the
 * returned function when it ends; `trackClosing` does both around a promise.
 */
export class ClosingResources {
  private readonly pending = new Map<number, string>();
  private nextId = 0;

  /** Records that `name` has begun to close; call the returned function when it has. */
  begin(name: string): () => void {
    const id = this.nextId++;
    this.pending.set(id, name);
    return () => {
      this.pending.delete(id);
    };
  }

  /** The names of the resources still closing, in the order they began. */
  list(): string[] {
    return [...this.pending.values()];
  }
}
