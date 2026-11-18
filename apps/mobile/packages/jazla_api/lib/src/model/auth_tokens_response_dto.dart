//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'auth_tokens_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AuthTokensResponseDto {
  /// Returns a new [AuthTokensResponseDto] instance.
  AuthTokensResponseDto({

    required  this.accessToken,

    required  this.accessTokenExpiresInSeconds,

    required  this.refreshToken,

    required  this.refreshTokenExpiresInSeconds,
  });

      /// The access token (a JWT; treat it as opaque), sent as `Authorization: Bearer <token>` on every request of its one audience. Signing out does not revoke it: it works until it expires.
  @JsonKey(
    
    name: r'accessToken',
    required: true,
    includeIfNull: false,
  )


  final String accessToken;



      /// How long the access token lives from now, in seconds (900, 15 minutes, by default; between 60 and 3600). Refresh when it runs out or on 401 ACCESS_TOKEN_EXPIRED.
          // minimum: 60
          // maximum: 3600
  @JsonKey(
    
    name: r'accessTokenExpiresInSeconds',
    required: true,
    includeIfNull: false,
  )


  final num accessTokenExpiresInSeconds;



      /// The refresh token: 43 URL-safe characters, exchanged once for a new pair (`POST /v1/public/auth/refresh`) and used to sign out (`POST /v1/public/auth/logout`). Keep it in secure storage (Keychain, Keystore) and replace it with each new one.
  @JsonKey(
    
    name: r'refreshToken',
    required: true,
    includeIfNull: false,
  )


  final String refreshToken;



      /// How long the refresh token lives from now, in seconds (2592000, 30 days, by default; between 86400 and 7776000). Unused for that long, the user signs in again.
          // minimum: 86400
          // maximum: 7776000
  @JsonKey(
    
    name: r'refreshTokenExpiresInSeconds',
    required: true,
    includeIfNull: false,
  )


  final num refreshTokenExpiresInSeconds;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AuthTokensResponseDto &&
      other.accessToken == accessToken &&
      other.accessTokenExpiresInSeconds == accessTokenExpiresInSeconds &&
      other.refreshToken == refreshToken &&
      other.refreshTokenExpiresInSeconds == refreshTokenExpiresInSeconds;

    @override
    int get hashCode =>
        accessToken.hashCode +
        accessTokenExpiresInSeconds.hashCode +
        refreshToken.hashCode +
        refreshTokenExpiresInSeconds.hashCode;

  factory AuthTokensResponseDto.fromJson(Map<String, dynamic> json) => _$AuthTokensResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AuthTokensResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

