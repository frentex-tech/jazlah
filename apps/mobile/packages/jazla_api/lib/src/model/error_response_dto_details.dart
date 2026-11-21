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
