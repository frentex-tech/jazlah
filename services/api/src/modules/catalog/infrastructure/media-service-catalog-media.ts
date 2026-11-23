import { Injectable } from '@nestjs/common';
import { MediaService } from '@modules/media';
import type { CatalogMediaFile } from '../domain/catalog-media-file.type';
import type { CatalogMedia } from '../domain/ports/catalog-media.port';

/** The catalog's view of uploaded files, through MediaService. */
@Injectable()
export class MediaServiceCatalogMedia implements CatalogMedia {
  constructor(private readonly media: MediaService) {}

  async findFiles(ids: readonly string[]): Promise<CatalogMediaFile[]> {
    if (ids.length === 0) {
      return [];
    }
    return (await this.media.findFiles(ids)).map((file) => ({
      id: file.id,
      ownerId: file.ownerId,
      purpose: file.purpose,
      isReady: file.status === 'ready',
    }));
  }

  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>> {
    return this.media.getPublicUrls(ids);
  }
}
