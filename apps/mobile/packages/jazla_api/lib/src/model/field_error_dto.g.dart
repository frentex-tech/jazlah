// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'field_error_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FieldErrorDto _$FieldErrorDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('FieldErrorDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['field', 'constraints']);
      final val = FieldErrorDto(
        field: $checkedConvert('field', (v) => v as String),
        constraints: $checkedConvert(
          'constraints',
          (v) => (v as List<dynamic>).map((e) => e as String).toList(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$FieldErrorDtoToJson(FieldErrorDto instance) =>
    <String, dynamic>{
      'field': instance.field,
      'constraints': instance.constraints,
    };
