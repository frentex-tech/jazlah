import type { FileLink } from '../file-link.type';
import type { VendorMediaFile } from '../vendor-media-file.type';

/** Injection token of the VendorMedia port. */
export const VENDOR_MEDIA = Symbol('VENDOR_MEDIA');

/** The uploaded files the vendors module refers to: documents and logos. */
export interface VendorMedia {
  /** The files with these ids; ids with no file are left out. */
  findFiles(ids: readonly string[]): Promise<VendorMediaFile[]>;

  /** The public URL of each ready public file among `ids` (logos), by id; no storage call. */
  publicUrls(ids: readonly string[]): Promise<ReadonlyMap<string, string>>;

  /** Where a ready file is read (a document, for the admin reviewing an application). */
  link(id: string): Promise<FileLink>;
}
