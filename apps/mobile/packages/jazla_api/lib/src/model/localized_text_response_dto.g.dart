// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'localized_text_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LocalizedTextResponseDto _$LocalizedTextResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('LocalizedTextResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['ar', 'en']);
  final val = LocalizedTextResponseDto(
    ar: $checkedConvert('ar', (v) => v as String),
    en: $checkedConvert('en', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$LocalizedTextResponseDtoToJson(
  LocalizedTextResponseDto instance,
) => <String, dynamic>{'ar': instance.ar, 'en': instance.en};
