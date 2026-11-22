# JAZLA API: integration guide for the frontend

These guides are for the developers of the Flutter customer app, the Next.js customer website and the Next.js dashboard (vendor, kitchen, admin), and for the Claude session that helps them. They explain how to call the API. The API's contract is `services/api/openapi.json`, and this folder sits beside it.

The rule above everything else: **`openapi.json` is the contract.** Every endpoint, field and error code here is taken from it, and CI checks that every path and code these files name still exists. If the API does not do what these files or `openapi.json` say, report it to the backend team. Do not work around it.

## What the API is

One HTTP API, JSON only, for every app. All routes are under `/v1`. The first segment after `/v1` is the **audience**, which tells you who may call the route:

| Prefix | Who calls it | Token |
|---|---|---|
| `/v1/public/...` | any app, signed in or not (sign-in, browsing) | none |
| `/v1/customer/...` | the customer app and the customer website | a customer access token |
| `/v1/vendor/...` | the vendor dashboard | a vendor access token |
| `/v1/kitchen/...` | the kitchen dashboard | a kitchen access token |
| `/v1/admin/...` | the admin dashboard | an admin access token |

An access token is issued for **one** audience. A customer token used on a `/v1/vendor/...` route gets `FORBIDDEN`, even when the same phone number also has vendor access. Each dashboard signs in separately, naming its audience (see [auth.md](auth.md)).

`/v1/health` and `/v1/health/ready` are for the load balancer. Apps never call them.

## Base URL per environment

| Environment | Base URL | Swagger page | OpenAPI JSON |
|---|---|---|---|
| Local (your machine) | `http://localhost:3000/v1` | `http://localhost:3000/docs` | `http://localhost:3000/docs-json` |
| Staging | `https://jazla-api-staging.onrender.com/v1` (free plan: the first call after 15 idle minutes takes about a minute; dashboard at `https://jazla-dashboard-staging.onrender.com`) | `https://jazla-api-staging.onrender.com/docs` | `https://jazla-api-staging.onrender.com/docs-json` |
| Production | not deployed yet | off by default in production | off by default in production |

Calling the local API from a device:
- **Android emulator:** `http://10.0.2.2:3000/v1`.
- **iOS simulator:** `http://localhost:3000/v1`.
- **Physical phone:** your computer's address on the local network, for example `http://192.168.1.20:3000/v1`.

**From a browser (the Next.js apps):** add your dev server's origin to `CORS_ORIGINS` in the API's `.env`, for example `CORS_ORIGINS=http://localhost:3001`. Then restart the API. When `CORS_ORIGINS` is empty, CORS is off and the browser refuses the responses.

The Swagger page and `/docs-json` describe the running code. `services/api/openapi.json` in the repository is the same document, committed. CI fails when the two differ.

## Running the backend locally

You need Docker (Docker Desktop on Windows or macOS), Node.js 26 (`services/api/.nvmrc`) and pnpm 10. Run every command in `services/api/`:

```bash
cp .env.example .env      # local settings; they match docker-compose.yml
pnpm install
pnpm db:generate          # the database client is generated, not committed
pnpm infra:up             # PostgreSQL + PostGIS (5434), Redis (6380), MinIO (9002, console 9003)
pnpm db:deploy            # apply the migrations
pnpm db:seed              # fill the database with development data (safe to run again)
pnpm start:dev            # the API on http://localhost:3000, restarting on code changes
```

Check that it runs:
- `http://localhost:3000/v1/health` answers `{"status":"ok"}`;
- `http://localhost:3000/docs` shows the Swagger page.

**Signing in without SMS.** Locally, no SMS is ever sent: the default SMS provider writes messages to the API's log. To sign in without reading the log, use the development accounts the seed creates. They sign in with a fixed code (see [auth.md](auth.md#development-sign-in-without-sms)).

To stop the containers, run `pnpm infra:down`. Your data is kept in Docker volumes.

## The files

| File | Answers |
|---|---|
| [conventions.md](conventions.md) | What do requests and responses look like? Covers bilingual fields, money, time, paging, request ids and rate limits. |
| [errors.md](errors.md) | What does an error look like, and what should the app do for each code? |
| [auth.md](auth.md) | How does a user sign in and stay signed in, which audience does each app use, and how do I sign in locally without SMS? |
| [uploads.md](uploads.md) | How do I upload an image or a document? |
| [customer-profile.md](customer-profile.md) | Customer app: profile, marketing consent, addresses, account deletion. |
| [vendors.md](vendors.md) | Becoming a vendor, the vendor profile, and the admin's vendor screens. |
| [coverage.md](coverage.md) | Do we deliver here? The public coverage check, `isCovered` on addresses, and the admin's zones map. |
| [catalog.md](catalog.md) | Browsing, the vendor's products, the admin's catalog: what applies at once and what goes to review. |
| [client-generation.md](client-generation.md) | Generating the Dart and TypeScript clients from `openapi.json`. |
| [not-built-yet.md](not-built-yet.md) | What the designs show that the API does not have yet, and what comes next. |
| [CLAUDE-SNIPPET.md](CLAUDE-SNIPPET.md) | The block to paste into your app's `CLAUDE.md`. |
