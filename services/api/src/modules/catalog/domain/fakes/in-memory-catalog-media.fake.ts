import type { CatalogMediaFile } from '../catalog-media-file.type';
import type { CatalogMedia } from '../ports/catalog-media.port';

/** CatalogMedia in memory: the files a test adds; public URLs derived from ids. */
export class InMemoryCatalogMedia implements CatalogMedia {
  private readonly files = new Map<string, CatalogMediaFile>();

  add(file: CatalogMediaFile): void {
    this.files.set(file.id, file);
  }

  findFiles(ids: readonly string[]): Promise<CatalogMediaFile[]> {
    return Promise.resolve(
      ids.flatMap((id) => {
        const file = this.files.get(id);
        return file === undefined ? [] : [file];
      }),
    );
  }

  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>> {
    return Promise.resolve(
      new Map(
        ids
          .filter((id) => this.files.get(id)?.isReady === true)
          .map((id) => [id, `https://cdn.example.invalid/${id}`]),
      ),
    );
  }
}
