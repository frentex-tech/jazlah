// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'readiness_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReadinessResponseDto _$ReadinessResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ReadinessResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['status', 'checks']);
  final val = ReadinessResponseDto(
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$ReadinessResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: ReadinessResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    checks: $checkedConvert(
      'checks',
      (v) => ReadinessChecksDto.fromJson(v as Map<String, dynamic>),
    ),
    draining: $checkedConvert('draining', (v) => v as bool?),
  );
  return val;
});

Map<String, dynamic> _$ReadinessResponseDtoToJson(
  ReadinessResponseDto instance,
) => <String, dynamic>{
  'status': _$ReadinessResponseDtoStatusEnumEnumMap[instance.status]!,
  'checks': instance.checks.toJson(),
  'draining': ?instance.draining,
};

const _$ReadinessResponseDtoStatusEnumEnumMap = {
  ReadinessResponseDtoStatusEnum.ok: 'ok',
  ReadinessResponseDtoStatusEnum.unavailable: 'unavailable',
  ReadinessResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
