//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'customer_profile_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerProfileResponseDto {
  /// Returns a new [CustomerProfileResponseDto] instance.
  CustomerProfileResponseDto({

    required  this.fullName,

    required  this.email,

    required  this.preferredLanguage,

    required  this.isComplete,
  });

      /// The customer's full name, 2 to 60 characters; null until the customer gives one.
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



      /// The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.
  @JsonKey(
    
    name: r'preferredLanguage',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CustomerProfileResponseDtoPreferredLanguageEnum.unknownDefaultOpenApi,
  )


  final CustomerProfileResponseDtoPreferredLanguageEnum preferredLanguage;



      /// Whether the profile has a full name. The app may be used without it; placing an order will require it.
  @JsonKey(
    
    name: r'isComplete',
    required: true,
    includeIfNull: false,
  )


  final bool isComplete;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerProfileResponseDto &&
      other.fullName == fullName &&
      other.email == email &&
      other.preferredLanguage == preferredLanguage &&
      other.isComplete == isComplete;

    @override
    int get hashCode =>
        (fullName == null ? 0 : fullName.hashCode) +
        (email == null ? 0 : email.hashCode) +
        preferredLanguage.hashCode +
        isComplete.hashCode;

  factory CustomerProfileResponseDto.fromJson(Map<String, dynamic> json) => _$CustomerProfileResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerProfileResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.
enum CustomerProfileResponseDtoPreferredLanguageEnum {
    /// The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.
@JsonValue(r'ar')
ar(r'ar'),
    /// The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.
@JsonValue(r'en')
en(r'en'),
    /// The language of messages to this customer: `ar` (Arabic, the default until the customer chooses) or `en`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CustomerProfileResponseDtoPreferredLanguageEnum(this.value);

final String value;

@override
String toString() => value;
}


