# CLAUDE.md snippet for the frontend apps

Paste the block below into your app's `CLAUDE.md` (Flutter app, Next.js website, Next.js dashboard). Adjust the paths if your app is not two folders below the repository root.

```markdown
## Talking to the JAZLA API

The backend's contract is `services/api/openapi.json`; the integration guides are in `docs/frontend/`.

- Before integrating any endpoint, read `docs/frontend/README.md`, `conventions.md`, `errors.md` and `auth.md`, then the guide of the module you are working on (`customer-profile.md`, `vendors.md`, `catalog.md`, `coverage.md`, `uploads.md`). Check `not-built-yet.md` before assuming an endpoint exists.
- Use the generated API client (`docs/frontend/client-generation.md`). Never hand-write an endpoint call, a URL, a request body or a response type. If `openapi.json` changed, regenerate the client first.
- Branch on the error `code`, never on `message` (`docs/frontend/errors.md`). Handle the codes the operation lists in `openapi.json`.
- Money is integer halalas with VAT included; timestamps are UTC, shown in Asia/Riyadh time; lists are paged with an opaque cursor (`docs/frontend/conventions.md`).
- Refresh the access token only on `ACCESS_TOKEN_EXPIRED`, one refresh at a time; `RECENT_SIGN_IN_REQUIRED` means sign in again, not refresh (`docs/frontend/auth.md`).
- Do not invent endpoints, fields, enum values or error codes. If the API does not match `openapi.json` or the guides, or a screen needs something the API does not have, stop and report the mismatch to the backend team (endpoint, request, response, `requestId`). Do not work around it in the app.
```
