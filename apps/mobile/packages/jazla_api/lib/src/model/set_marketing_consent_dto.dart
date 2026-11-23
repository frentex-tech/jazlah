//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_marketing_consent_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetMarketingConsentDto {
  /// Returns a new [SetMarketingConsentDto] instance.
  SetMarketingConsentDto({

    required  this.granted,
  });

      /// true grants marketing messages, false withdraws the consent. Required, as a JSON boolean (null, `\"true\"` or `1` is VALIDATION_FAILED).
  @JsonKey(
    
    name: r'granted',
    required: true,
    includeIfNull: false,
  )


  final bool granted;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetMarketingConsentDto &&
      other.granted == granted;

    @override
    int get hashCode =>
        granted.hashCode;

  factory SetMarketingConsentDto.fromJson(Map<String, dynamic> json) => _$SetMarketingConsentDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetMarketingConsentDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

