import type { FileLink } from '../domain/file-link.type';
import type { VendorApplication } from '../domain/vendor-application.entity';

/** An application with a link to read each of its documents, for the admin reviewing it. */
export type VendorApplicationWithLinks = Readonly<{
  application: VendorApplication;
  /** By media id. */
  documentLinks: ReadonlyMap<string, FileLink>;
}>;
