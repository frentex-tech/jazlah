//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'refresh_token_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class RefreshTokenDto {
  /// Returns a new [RefreshTokenDto] instance.
  RefreshTokenDto({

    required  this.refreshToken,
  });

      /// The refresh token of the session, as the last sign-in or refresh returned it (43 URL-safe characters). Accepted from 20 to 200 characters; a token the API does not know is not a validation error.
  @JsonKey(
    
    name: r'refreshToken',
    required: true,
    includeIfNull: false,
  )


  final String refreshToken;





    @override
    bool operator ==(Object other) => identical(this, other) || other is RefreshTokenDto &&
      other.refreshToken == refreshToken;

    @override
    int get hashCode =>
        refreshToken.hashCode;

  factory RefreshTokenDto.fromJson(Map<String, dynamic> json) => _$RefreshTokenDtoFromJson(json);

  Map<String, dynamic> toJson() => _$RefreshTokenDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

