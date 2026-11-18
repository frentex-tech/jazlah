// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'marketing_consent_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MarketingConsentResponseDto _$MarketingConsentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('MarketingConsentResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['granted', 'changedAt']);
  final val = MarketingConsentResponseDto(
    granted: $checkedConvert('granted', (v) => v as bool),
    changedAt: $checkedConvert(
      'changedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
  );
  return val;
});

Map<String, dynamic> _$MarketingConsentResponseDtoToJson(
  MarketingConsentResponseDto instance,
) => <String, dynamic>{
  'granted': instance.granted,
  'changedAt': instance.changedAt?.toIso8601String(),
};
