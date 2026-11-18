// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'localized_description_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LocalizedDescriptionDto _$LocalizedDescriptionDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('LocalizedDescriptionDto', json, ($checkedConvert) {
  final val = LocalizedDescriptionDto(
    ar: $checkedConvert('ar', (v) => v as String?),
    en: $checkedConvert('en', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$LocalizedDescriptionDtoToJson(
  LocalizedDescriptionDto instance,
) => <String, dynamic>{'ar': ?instance.ar, 'en': ?instance.en};
