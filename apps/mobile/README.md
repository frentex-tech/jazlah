# JAZLA customer app (Flutter)

iOS 14+ and Android 8+ (SDK 26), Arabic (RTL, default) and English. Flutter 3.44 stable.

## Run

```bash
cp config/staging.example.json config/staging.json   # fill in keys, see config/README.md
flutter run --flavor staging -t lib/main_staging.dart --dart-define-from-file=config/staging.json
```

| Flavor | Bundle id | Entry point |
|---|---|---|
| dev | `sa.jazlah.app.dev` | `lib/main_dev.dart` |
| staging | `sa.jazlah.app.staging` | `lib/main_staging.dart` |
| prod | `sa.jazlah.app` | `lib/main_prod.dart` |

Without a backend, set `"USE_MOCKS": "true"` in the config file. Outside prod, the widget gallery is at `/gallery`.

iOS uses Swift Package Manager where plugins support it and **CocoaPods** for the rest (`google_maps_flutter` has no SPM package yet), so install CocoaPods (`pod --version`). The flavors' Xcode configurations and schemes were created by `scripts/setup_ios_flavors.rb`; the Podfile maps them.

Maps: without a key the map picker uses a mock map; see `config/README.md` for the three places the key goes.

## Layout (`docs/architecture.md` §4)

```
lib/
  main_<flavor>.dart     app/bootstrap.dart
  app/                   router, theme (tokens from docs/design/tokens.json), locale, providers
  core/api/              Dio interceptor: token, Accept-Language, single-flight refresh
  core/storage/          secure token storage, shared preferences
  core/errors/           ApiError (branch on code)
  core/widgets/          design-system widgets (J*) + debug gallery
  features/<feature>/    data / domain / presentation
  l10n/                  app_ar.arb (template), app_en.arb
packages/jazla_api/      generated API client (committed)
```

## API client

Generated from `services/api/openapi.json` with OpenAPI Generator `dart-dio` 7.10.0 and **committed**. Regenerate whenever `openapi.json` changes (needs Java 11+ and Node):

```bash
./scripts/gen-api-client.sh
```

CI regenerates it and fails on a difference. The script patches one model the generator cannot express (`ErrorResponseDtoDetails`, a oneOf) and keeps the package lock.

## Design

Screens follow `docs/design/spec/app/<node-id>.json` (node ids per screen in `docs/design/screens.md`); widgets follow `docs/design/spec/ds/`. Fonts are Readex Pro (text) and El Messiri (display), bundled from Google Fonts under the OFL (`assets/fonts/OFL-*.txt`); Figma shows Thmanyah, so compare size, weight and line height, not the family.

## Checks

```bash
flutter analyze && flutter test
```
