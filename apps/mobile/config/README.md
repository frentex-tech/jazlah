# Local config per flavor

Copy `<flavor>.example.json` to `<flavor>.json` (git-ignored) and fill in the keys. Run with:

```bash
flutter run --flavor staging -t lib/main_staging.dart --dart-define-from-file=config/staging.json
```

| Key | Meaning | Empty means |
|---|---|---|
| `API_BASE_URL` | API host without `/v1` (the paths in openapi.json start with `/v1`) | `http://localhost:3000` (iOS simulator); use `http://10.0.2.2:3000` on the Android emulator |
| `INITIAL_ROUTE` | dev/staging only: start on this route (e.g. `/gallery`) for design QA | `/` |
| `USE_MOCKS` | `true` serves the feature repositories from memory, so the app runs without a backend (each feature adds its mock with its screens) | real API |
| `GOOGLE_MAPS_API_KEY` | Google Maps key for the Dart side: shows the Google map and enables Google reverse geocoding and search. Set the same key natively: `GOOGLE_MAPS_API_KEY=` in `android/local.properties`, and in `ios/Flutter/Secrets.xcconfig` (copy `Secrets.example.xcconfig`); all three are git-ignored | a pannable mock map and sample places; the pin, the permission flow and the coverage check still work |
| `FIREBASE_*` | Firebase options of the flavor's project, read when push lands (NOT-MOB-1); the dev/staging projects do not exist yet | Firebase is not initialised |

Never commit the filled files. Staging and production keys come from the team's secret store, not from this folder.
