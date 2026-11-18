// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'optional_localized_text_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OptionalLocalizedTextResponseDto _$OptionalLocalizedTextResponseDtoFromJson(
  Map<String, dynamic> json,
) =>
    $checkedCreate('OptionalLocalizedTextResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['ar', 'en']);
      final val = OptionalLocalizedTextResponseDto(
        ar: $checkedConvert('ar', (v) => v as String?),
        en: $checkedConvert('en', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$OptionalLocalizedTextResponseDtoToJson(
  OptionalLocalizedTextResponseDto instance,
) => <String, dynamic>{'ar': instance.ar, 'en': instance.en};
