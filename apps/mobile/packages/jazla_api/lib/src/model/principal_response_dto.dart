//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'principal_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PrincipalResponseDto {
  /// Returns a new [PrincipalResponseDto] instance.
  PrincipalResponseDto({

    required  this.userId,

    required  this.phone,

    required  this.audience,

    required  this.organisationId,

    required  this.sessionId,
  });

      /// The user (UUID). The same person has one user id in every app.
  @JsonKey(
    
    name: r'userId',
    required: true,
    includeIfNull: false,
  )


  final String userId;



      /// The phone number, masked: the country code and the last two digits only.
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: false,
  )


  final String phone;



      /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
  @JsonKey(
    
    name: r'audience',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PrincipalResponseDtoAudienceEnum.unknownDefaultOpenApi,
  )


  final PrincipalResponseDtoAudienceEnum audience;



      /// The vendor or kitchen the user acts for (UUID); null for customers and admins.
  @JsonKey(
    
    name: r'organisationId',
    required: true,
    includeIfNull: true,
  )


  final String? organisationId;



      /// The session (UUID): one sign-in on one device, ended by signing out.
  @JsonKey(
    
    name: r'sessionId',
    required: true,
    includeIfNull: false,
  )


  final String sessionId;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PrincipalResponseDto &&
      other.userId == userId &&
      other.phone == phone &&
      other.audience == audience &&
      other.organisationId == organisationId &&
      other.sessionId == sessionId;

    @override
    int get hashCode =>
        userId.hashCode +
        phone.hashCode +
        audience.hashCode +
        (organisationId == null ? 0 : organisationId.hashCode) +
        sessionId.hashCode;

  factory PrincipalResponseDto.fromJson(Map<String, dynamic> json) => _$PrincipalResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PrincipalResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
enum PrincipalResponseDtoAudienceEnum {
    /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
@JsonValue(r'customer')
customer(r'customer'),
    /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
@JsonValue(r'vendor')
vendor(r'vendor'),
    /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
@JsonValue(r'kitchen')
kitchen(r'kitchen'),
    /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
@JsonValue(r'admin')
admin(r'admin'),
    /// The one audience this sign-in is for: its tokens work only on the routes of that audience (`/v1/<audience>/...`).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const PrincipalResponseDtoAudienceEnum(this.value);

final String value;

@override
String toString() => value;
}


