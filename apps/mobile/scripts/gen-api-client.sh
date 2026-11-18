#!/usr/bin/env bash
# Regenerates packages/jazla_api from services/api/openapi.json (see docs/frontend/client-generation.md).
# Needs Java 11+ (JAVA_HOME) and Node. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=packages/jazla_api
# Keep the package lock so CI regenerates with the same json_serializable version.
LOCK=$(mktemp); [ -f "$OUT/pubspec.lock" ] && cp "$OUT/pubspec.lock" "$LOCK"
rm -rf "$OUT"
mkdir -p "$OUT"
# The generated stub tests and docs are noise in the repo.
printf 'test/**\ndoc/**\n.gitignore\n' > "$OUT/.openapi-generator-ignore"
npx -y @openapitools/openapi-generator-cli@2.42.2 generate \
  -i ../../services/api/openapi.json -g dart-dio -o "$OUT" \
  --additional-properties=pubName=jazla_api,pubAuthor=Frentex,nullableFields=true,serializationLibrary=json_serializable,enumUnknownDefaultCase=true

# json_serializable emits null-aware elements, which need Dart 3.8.
sed -i.bak "s/sdk: '>=2.17.0 <4.0.0'/sdk: '>=3.8.0 <4.0.0'/" "$OUT/pubspec.yaml" && rm "$OUT/pubspec.yaml.bak"

# Generator 7.10 cannot model ErrorResponseDto.details (oneOf array | object): keep it as raw JSON.
cat > "$OUT/lib/src/model/error_response_dto_details.dart" <<'DART'
//
// Patched by scripts/gen-api-client.sh: the generator emits an empty class for this oneOf.
//

/// `details` of an error: a list of field errors for VALIDATION_FAILED, an object for some codes.
class ErrorResponseDtoDetails {
  ErrorResponseDtoDetails(this.value);

  factory ErrorResponseDtoDetails.fromJson(Object? json) => ErrorResponseDtoDetails(json);

  final Object? value;

  Object? toJson() => value;
}
DART

[ -s "$LOCK" ] && cp "$LOCK" "$OUT/pubspec.lock"
cd "$OUT"
dart pub get
dart run build_runner build --delete-conflicting-outputs
