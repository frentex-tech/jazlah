//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'update_customer_profile_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateCustomerProfileDto {
  /// Returns a new [UpdateCustomerProfileDto] instance.
  UpdateCustomerProfileDto({

     this.fullName,

     this.email,

     this.preferredLanguage,
  });

      /// The customer's full name: 2 to 60 characters, counted in Unicode code points (an emoji with a variation selector counts as 2), after invisible format characters are removed and runs of spaces made one. The profile is complete once it has one. Left out keeps the current name; null is VALIDATION_FAILED (a name cannot be removed).
  @JsonKey(
    
    name: r'fullName',
    required: false,
    includeIfNull: false,
  )


  final String? fullName;



      /// An email address, up to 254 characters; stored lowercase and not verified (two accounts may give the same one). null or blank removes it; left out keeps the current one.
  @JsonKey(
    
    name: r'email',
    required: false,
    includeIfNull: false,
  )


  final String? email;



      /// The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.
  @JsonKey(
    
    name: r'preferredLanguage',
    required: false,
    includeIfNull: false,
  unknownEnumValue: UpdateCustomerProfileDtoPreferredLanguageEnum.unknownDefaultOpenApi,
  )


  final UpdateCustomerProfileDtoPreferredLanguageEnum? preferredLanguage;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateCustomerProfileDto &&
      other.fullName == fullName &&
      other.email == email &&
      other.preferredLanguage == preferredLanguage;

    @override
    int get hashCode =>
        fullName.hashCode +
        (email == null ? 0 : email.hashCode) +
        preferredLanguage.hashCode;

  factory UpdateCustomerProfileDto.fromJson(Map<String, dynamic> json) => _$UpdateCustomerProfileDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateCustomerProfileDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.
enum UpdateCustomerProfileDtoPreferredLanguageEnum {
    /// The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.
@JsonValue(r'ar')
ar(r'ar'),
    /// The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.
@JsonValue(r'en')
en(r'en'),
    /// The language of messages to this customer: `ar` or `en`. Left out keeps the current one; null is VALIDATION_FAILED.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const UpdateCustomerProfileDtoPreferredLanguageEnum(this.value);

final String value;

@override
String toString() => value;
}


