//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/principal_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'signed_in_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SignedInResponseDto {
  /// Returns a new [SignedInResponseDto] instance.
  SignedInResponseDto({

    required  this.accessToken,

    required  this.accessTokenExpiresInSeconds,

    required  this.refreshToken,

    required  this.refreshTokenExpiresInSeconds,

    required  this.principal,

    required  this.profileComplete,
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



      /// Who signed in, for which audience and session.
  @JsonKey(
    
    name: r'principal',
    required: true,
    includeIfNull: false,
  )


  final PrincipalResponseDto principal;



      /// Whether the customer's profile is complete (has a full name): when false the app may show the completion screen, which the customer can skip. Null for vendor, kitchen and admin sign-ins.
  @JsonKey(
    
    name: r'profileComplete',
    required: true,
    includeIfNull: true,
  )


  final bool? profileComplete;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SignedInResponseDto &&
      other.accessToken == accessToken &&
      other.accessTokenExpiresInSeconds == accessTokenExpiresInSeconds &&
      other.refreshToken == refreshToken &&
      other.refreshTokenExpiresInSeconds == refreshTokenExpiresInSeconds &&
      other.principal == principal &&
      other.profileComplete == profileComplete;

    @override
    int get hashCode =>
        accessToken.hashCode +
        accessTokenExpiresInSeconds.hashCode +
        refreshToken.hashCode +
        refreshTokenExpiresInSeconds.hashCode +
        principal.hashCode +
        (profileComplete == null ? 0 : profileComplete.hashCode);

  factory SignedInResponseDto.fromJson(Map<String, dynamic> json) => _$SignedInResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SignedInResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

