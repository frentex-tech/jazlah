# Registry: Encryption

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **encryptAes256Gcm** — `src/common/crypto/encrypt-aes-256-gcm.ts` — data at rest the API must read back (an IBAN), with the key's id; `src/common/crypto/decrypt-aes-256-gcm.ts`, `src/common/crypto/encrypted-text.type.ts`, `src/common/crypto/encryption-key.type.ts`.
- **hashRequestBody** — `src/common/crypto/hash-request-body.ts` — SHA-256 (hex) of a request body's canonical JSON (keys sorted, `undefined` left out): tells a retry of the same request from a different one (the body hash kept with an `Idempotency-Key`).
