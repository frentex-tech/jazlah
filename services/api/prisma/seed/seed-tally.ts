/**
 * What one run of the seed did, for its printed summary: per kind of row, how many it
 * created and how many were already there (a second run creates none), plus the objects
 * it uploaded and anything it left alone that a developer should know about.
 */
export class SeedTally {
  private readonly counts = new Map<
    string,
    { created: number; existing: number }
  >();
  private readonly notes: string[] = [];

  /** Records rows of `kind`: `created` new ones, `existing` already there. */
  add(kind: string, created: number, existing: number): void {
    const current = this.counts.get(kind) ?? { created: 0, existing: 0 };
    this.counts.set(kind, {
      created: current.created + created,
      existing: current.existing + existing,
    });
  }

  /** Records one row of `kind`, created or already there. */
  one(kind: string, created: boolean): void {
    this.add(kind, created ? 1 : 0, created ? 0 : 1);
  }

  /** Something the seed left as it found it, to print at the end. */
  note(message: string): void {
    this.notes.push(message);
  }

  /** The summary, one line per kind in the order first recorded, then the notes. */
  lines(): string[] {
    const width = Math.max(
      ...[...this.counts.keys()].map((kind) => kind.length),
    );
    return [
      ...[...this.counts].map(
        ([kind, { created, existing }]) =>
          `  ${kind.padEnd(width)}  ${created} created, ${existing} already there`,
      ),
      ...this.notes.map((note) => `  note: ${note}`),
    ];
  }
}
