import type { FileLink } from '../file-link.type';
import type { VendorMedia } from '../ports/vendor-media.port';
import type { VendorMediaFile } from '../vendor-media-file.type';

/** VendorMedia in memory: the files a test adds, public URLs and links derived from ids. */
export class InMemoryVendorMedia implements VendorMedia {
  private readonly files = new Map<string, VendorMediaFile>();
  /** How many times publicUrls was called, to prove one read per list. */
  publicUrlCalls = 0;

  add(file: VendorMediaFile): void {
    this.files.set(file.id, file);
  }

  findFiles(ids: readonly string[]): Promise<VendorMediaFile[]> {
    return Promise.resolve(
      ids.flatMap((id) => {
        const file = this.files.get(id);
        return file === undefined ? [] : [file];
      }),
    );
  }

  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>> {
    this.publicUrlCalls += 1;
    return Promise.resolve(
      new Map(
        ids
          .filter((id) => this.files.get(id)?.isReady === true)
          .map((id) => [id, `https://cdn.example.invalid/${id}`]),
      ),
    );
  }

  link(id: string): Promise<FileLink> {
    return Promise.resolve({
      url: `https://storage.example.invalid/${id}`,
      expiresAt: new Date('2026-11-15T12:05:00.000Z'),
    });
  }
}
