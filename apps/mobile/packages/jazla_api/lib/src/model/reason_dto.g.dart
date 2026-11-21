// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reason_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReasonDto _$ReasonDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ReasonDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['reason']);
      final val = ReasonDto(
        reason: $checkedConvert('reason', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$ReasonDtoToJson(ReasonDto instance) => <String, dynamic>{
  'reason': instance.reason,
};
