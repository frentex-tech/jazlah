// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_marketing_consent_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetMarketingConsentDto _$SetMarketingConsentDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetMarketingConsentDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['granted']);
  final val = SetMarketingConsentDto(
    granted: $checkedConvert('granted', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$SetMarketingConsentDtoToJson(
  SetMarketingConsentDto instance,
) => <String, dynamic>{'granted': instance.granted};
