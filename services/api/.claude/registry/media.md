# Registry: Media and files

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **MediaService** — `src/modules/media/media.service.ts` — `requestUpload`, `confirmUpload`, `getDownloadLink`; `src/modules/media/dto/request-upload.dto.ts`, types in `src/modules/media/index.ts`.
- **Upload purposes** — `src/modules/media/upload-purposes.constants.ts` — `UPLOAD_PURPOSES`; a module needing uploads adds its own.
- **detectContentType** — `src/common/files/detect-content-type.ts` — a file's type from its first bytes: `src/common/files/content-signatures.constants.ts`, `src/common/files/content-signature.type.ts`, `src/common/files/detectable-content-type.type.ts`.
- **sanitizeFileName** — `src/common/files/sanitize-file-name.ts` — a client's file name made safe to store and show.
