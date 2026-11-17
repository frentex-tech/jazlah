import type { FileLink } from '../file-link.type';
import type { VendorMediaFile } from '../vendor-media-file.type';

/** Injection token of the VendorMedia port. */
export const VENDOR_MEDIA = Symbol('VENDOR_MEDIA');

/** The uploaded files the vendors module refers to: documents, logos and cover photos. */
export interface VendorMedia {
  /** The files with these ids; ids with no file are left out. */
  findFiles(ids: readonly string[]): Promise<VendorMediaFile[]>;

  /** The public URL of each ready public file among `ids` (logos, cover photos), by id; no storage call. */
  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;

  /** Where a ready file is read (a document, for the admin reviewing an application). */
  link(id: string): Promise<FileLink>;

  /**
   * Marks every `vendor.document` file of `ownerId` for removal, except the ids in
   * `keep` (an account deletion). Database only, inside the caller's transaction; the
   * media cleanup job deletes the objects after the commit.
   */
  discardDocumentsOf(ownerId: string, keep: readonly string[]): Promise<void>;
}
