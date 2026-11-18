// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'readiness_checks_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReadinessChecksDto _$ReadinessChecksDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ReadinessChecksDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['database', 'redis']);
      final val = ReadinessChecksDto(
        database: $checkedConvert(
          'database',
          (v) => $enumDecode(
            _$ReadinessChecksDtoDatabaseEnumEnumMap,
            v,
            unknownValue: ReadinessChecksDtoDatabaseEnum.unknownDefaultOpenApi,
          ),
        ),
        redis: $checkedConvert(
          'redis',
          (v) => $enumDecode(
            _$ReadinessChecksDtoRedisEnumEnumMap,
            v,
            unknownValue: ReadinessChecksDtoRedisEnum.unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ReadinessChecksDtoToJson(ReadinessChecksDto instance) =>
    <String, dynamic>{
      'database': _$ReadinessChecksDtoDatabaseEnumEnumMap[instance.database]!,
      'redis': _$ReadinessChecksDtoRedisEnumEnumMap[instance.redis]!,
    };

const _$ReadinessChecksDtoDatabaseEnumEnumMap = {
  ReadinessChecksDtoDatabaseEnum.up: 'up',
  ReadinessChecksDtoDatabaseEnum.down: 'down',
  ReadinessChecksDtoDatabaseEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$ReadinessChecksDtoRedisEnumEnumMap = {
  ReadinessChecksDtoRedisEnum.up: 'up',
  ReadinessChecksDtoRedisEnum.down: 'down',
  ReadinessChecksDtoRedisEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
