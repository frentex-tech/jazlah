import { Injectable } from '@nestjs/common';
import { MediaService } from '@modules/media';
import type { FileLink } from '../domain/file-link.type';
import type { VendorMedia } from '../domain/ports/vendor-media.port';
import type { VendorMediaFile } from '../domain/vendor-media-file.type';

/** The vendors module's view of uploaded files, through MediaService. */
@Injectable()
export class MediaServiceVendorMedia implements VendorMedia {
  constructor(private readonly media: MediaService) {}

  async findFiles(ids: readonly string[]): Promise<VendorMediaFile[]> {
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

  link(id: string): Promise<FileLink> {
    return this.media.getDownloadLink(id);
  }

  async discardDocumentsOf(
    ownerId: string,
    keep: readonly string[],
  ): Promise<void> {
    await this.media.discardOwnFiles(ownerId, 'vendor.document', keep);
  }
}
