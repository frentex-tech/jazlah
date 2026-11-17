# Client generation: Dart and TypeScript from `openapi.json`

Do not hand-write endpoint calls, request bodies or response types. Generate them from `services/api/openapi.json`, the API's contract (OpenAPI 3.0). Every operation in it has:
- a stable `operationId`, which becomes the method name: `customerCreateAddress`, `publicVerifyOtp`;
- one tag, which becomes the API class: `Customer addresses` becomes `CustomerAddressesApi`.

**Regenerate whenever `openapi.json` changes.** That includes a pull from the main branch that touches it, and a backend release. Commit the generated code, or regenerate in your build: pick one per app and write it in your README. A change in `openapi.json` shows up as a diff in the generated code; read it, because it is exactly what changed in the API.

The paths below assume the app lives in the same repository (`apps/mobile`, `apps/web`, `apps/dashboard`) and reads `../../services/api/openapi.json`. Adjust the relative path if yours differs.

## Dart (Flutter): `dart-dio`

The generator is OpenAPI Generator. Its `dart-dio` generator produces a Dio-based package with typed models. Run it with Docker, so you need no Java:

```bash
# from apps/mobile
docker run --rm -v "${PWD}/../..:/local" openapitools/openapi-generator-cli:v7.10.0 generate \
  -i /local/services/api/openapi.json \
  -g dart-dio \
  -o /local/apps/mobile/packages/jazla_api \
  --additional-properties=pubName=jazla_api,pubAuthor=Frentex,nullableFields=true,serializationLibrary=json_serializable,enumUnknownDefaultCase=true

cd packages/jazla_api
dart pub get
dart run build_runner build --delete-conflicting-outputs
```

Or, with Java 11+ installed: `npx @openapitools/openapi-generator-cli@2.42.2 generate` with the same arguments. Pin the generator version with `openapitools.json` (`"generator-cli": { "version": "7.10.0" }`).

Then, in the app:

```yaml
# pubspec.yaml
dependencies:
  jazla_api:
    path: packages/jazla_api
```

```dart
final api = JazlaApi(basePathOverride: 'http://10.0.2.2:3000');
// The paths in openapi.json already start with /v1: the base path is the host only.

final addresses = await api
    .getCustomerAddressesApi()
    .customerListAddresses(); // one call per operationId
```

Notes:
- `enumUnknownDefaultCase=true` turns an enum value added later into `unknownDefaultOpenApi` instead of a crash. Handle it as "other".
- Add the access token with a Dio interceptor that implements [auth.md](auth.md): attach the token, run one refresh at a time on `ACCESS_TOKEN_EXPIRED`, then repeat the request.
- Errors come as `DioException`. Read `response.data` as `ErrorResponseDto` and branch on `code` (see [errors.md](errors.md)).

## TypeScript (Next.js): `openapi-typescript` + `openapi-fetch`

`openapi-typescript` turns `openapi.json` into types, and `openapi-fetch` is a small typed `fetch` wrapper over them. No runtime code is generated, and the paths, bodies, query parameters and responses are all type-checked.

```bash
# from apps/web or apps/dashboard
pnpm add openapi-fetch@0.17.0
pnpm add -D openapi-typescript@7.13.0

# add to package.json "scripts":
#   "api:generate": "openapi-typescript ../../services/api/openapi.json -o src/api/schema.d.ts"
pnpm api:generate
```

```ts
// src/api/client.ts
import createClient from 'openapi-fetch';
import type { paths, components } from './schema';

export type ErrorResponse = components['schemas']['ErrorResponseDto'];

export const api = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL, // http://localhost:3000 (the paths include /v1)
});

// A typed call: the path, the body and the answer all come from openapi.json.
const { data, error } = await api.GET('/v1/vendor/products', {
  params: { query: { status: 'pending_review', limit: 20 } },
  headers: { Authorization: `Bearer ${accessToken}` },
});
if (error) {
  // error is ErrorResponseDto: branch on error.code
}
```

Notes:
- Add the token and the refresh logic once, as `openapi-fetch` middleware (`api.use({ onRequest, onResponse })`), following [auth.md](auth.md).
- Enums arrive as string unions. A `switch` with a `default` branch handles a value added later.
- The dashboard and the website each generate their own `schema.d.ts` from the same file.

## Checking that your client is current

Add a CI step to each app that regenerates and fails on a difference, the same way the API checks `openapi.json` against its code:

```bash
pnpm api:generate && git diff --exit-code -- src/api/schema.d.ts
```

For Flutter, run the generate command, then `git diff --exit-code -- packages/jazla_api`.
