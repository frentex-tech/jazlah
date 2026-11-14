import type { DetectableContentType } from './detectable-content-type.type';

/**
 * How a content type is recognised: every part must match, each a run of bytes at an
 * offset from the start of the file.
 */
export type ContentSignature = Readonly<{
  contentType: DetectableContentType;
  parts: readonly Readonly<{ offset: number; bytes: readonly number[] }>[];
}>;
