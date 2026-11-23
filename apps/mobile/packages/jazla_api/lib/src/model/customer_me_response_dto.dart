//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/marketing_consent_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_me_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerMeResponseDto {
  /// Returns a new [CustomerMeResponseDto] instance.
  CustomerMeResponseDto({

    required  this.userId,

    required  this.phone,

    required  this.audience,

    required  this.organisationId,

    required  this.sessionId,

    required  this.fullName,

    required  this.email,

    required  this.preferredLanguage,

    required  this.profileComplete,

    required  this.marketingConsent,
  });

      /// The customer (user id, UUID).
  @JsonKey(
    
    name: r'userId',
    required: true,
    includeIfNull: false,
  )


  final String userId;



      /// The customer's own phone number, in full, in E.164 (`+9665` and 8 digits). For the profile screen.
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: false,
  )


  final String phone;



      /// The audience of this sign-in: always `customer` here.
  @JsonKey(
    
    name: r'audience',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CustomerMeResponseDtoAudienceEnum.unknownDefaultOpenApi,
  )


  final CustomerMeResponseDtoAudienceEnum audience;



      /// Always null for a customer.
  @JsonKey(
    
    name: r'organisationId',
    required: true,
    includeIfNull: true,
  )


  final String? organisationId;



      /// The session (UUID): this sign-in on this device, ended by signing out.
  @JsonKey(
    
    name: r'sessionId',
    required: true,
    includeIfNull: false,
  )


  final String sessionId;



      /// The full name as the customer typed it; null until the customer gives one.
  @JsonKey(
    
    name: r'fullName',
    required: true,
    includeIfNull: true,
  )


  final String? fullName;



      /// The email address, lowercase and not verified; null when the customer gave none or removed it.
  @JsonKey(
    
    name: r'email',
    required: true,
    includeIfNull: true,
  )


  final String? email;



      /// The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.
  @JsonKey(
    
    name: r'preferredLanguage',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CustomerMeResponseDtoPreferredLanguageEnum.unknownDefaultOpenApi,
  )


  final CustomerMeResponseDtoPreferredLanguageEnum preferredLanguage;



      /// Whether the profile has a full name. The app may be used without it; placing an order will require it.
  @JsonKey(
    
    name: r'profileComplete',
    required: true,
    includeIfNull: false,
  )


  final bool profileComplete;



      /// Whether the customer agreed to receive marketing messages.
  @JsonKey(
    
    name: r'marketingConsent',
    required: true,
    includeIfNull: false,
  )


  final MarketingConsentResponseDto marketingConsent;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerMeResponseDto &&
      other.userId == userId &&
      other.phone == phone &&
      other.audience == audience &&
      other.organisationId == organisationId &&
      other.sessionId == sessionId &&
      other.fullName == fullName &&
      other.email == email &&
      other.preferredLanguage == preferredLanguage &&
      other.profileComplete == profileComplete &&
      other.marketingConsent == marketingConsent;

    @override
    int get hashCode =>
        userId.hashCode +
        phone.hashCode +
        audience.hashCode +
        (organisationId == null ? 0 : organisationId.hashCode) +
        sessionId.hashCode +
        (fullName == null ? 0 : fullName.hashCode) +
        (email == null ? 0 : email.hashCode) +
        preferredLanguage.hashCode +
        profileComplete.hashCode +
        marketingConsent.hashCode;

  factory CustomerMeResponseDto.fromJson(Map<String, dynamic> json) => _$CustomerMeResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerMeResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The audience of this sign-in: always `customer` here.
enum CustomerMeResponseDtoAudienceEnum {
    /// The audience of this sign-in: always `customer` here.
@JsonValue(r'customer')
customer(r'customer'),
    /// The audience of this sign-in: always `customer` here.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CustomerMeResponseDtoAudienceEnum(this.value);

final String value;

@override
String toString() => value;
}


/// The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.
enum CustomerMeResponseDtoPreferredLanguageEnum {
    /// The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.
@JsonValue(r'ar')
ar(r'ar'),
    /// The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.
@JsonValue(r'en')
en(r'en'),
    /// The language of messages sent to the customer (SMS, notifications): `ar` (the default) or `en`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CustomerMeResponseDtoPreferredLanguageEnum(this.value);

final String value;

@override
String toString() => value;
}


