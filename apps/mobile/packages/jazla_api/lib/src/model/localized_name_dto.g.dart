// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'localized_name_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LocalizedNameDto _$LocalizedNameDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('LocalizedNameDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['ar', 'en']);
      final val = LocalizedNameDto(
        ar: $checkedConvert('ar', (v) => v as String),
        en: $checkedConvert('en', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$LocalizedNameDtoToJson(LocalizedNameDto instance) =>
    <String, dynamic>{'ar': instance.ar, 'en': instance.en};
