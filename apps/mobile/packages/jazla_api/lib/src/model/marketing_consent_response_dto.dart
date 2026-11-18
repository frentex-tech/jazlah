//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'marketing_consent_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class MarketingConsentResponseDto {
  /// Returns a new [MarketingConsentResponseDto] instance.
  MarketingConsentResponseDto({

    required  this.granted,

    required  this.changedAt,
  });

      /// Whether the customer accepts marketing messages. False until the customer grants it (opt-in).
  @JsonKey(
    
    name: r'granted',
    required: true,
    includeIfNull: false,
  )


  final bool granted;



      /// When the current choice was recorded, UTC (ISO 8601); null when the customer never chose (granted is then false).
  @JsonKey(
    
    name: r'changedAt',
    required: true,
    includeIfNull: true,
  )


  final DateTime? changedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is MarketingConsentResponseDto &&
      other.granted == granted &&
      other.changedAt == changedAt;

    @override
    int get hashCode =>
        granted.hashCode +
        (changedAt == null ? 0 : changedAt.hashCode);

  factory MarketingConsentResponseDto.fromJson(Map<String, dynamic> json) => _$MarketingConsentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$MarketingConsentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

