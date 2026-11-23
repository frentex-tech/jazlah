/**
 * What a client needs to upload one file: POST `url` as multipart/form-data with every
 * entry of `fields`, then the file in a part named `file`, last, before `expiresAt`;
 * then confirm `mediaId`.
 */
export type UploadTicket = Readonly<{
  mediaId: string;
  url: string;
  fields: Readonly<Record<string, string>>;
  expiresAt: Date;
  /** The last moment the upload may be confirmed. */
  confirmBy: Date;
}>;
