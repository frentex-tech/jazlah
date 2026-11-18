// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'liveness_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LivenessResponseDto _$LivenessResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('LivenessResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['status']);
      final val = LivenessResponseDto(
        status: $checkedConvert(
          'status',
          (v) => $enumDecode(
            _$LivenessResponseDtoStatusEnumEnumMap,
            v,
            unknownValue: LivenessResponseDtoStatusEnum.unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$LivenessResponseDtoToJson(
  LivenessResponseDto instance,
) => <String, dynamic>{
  'status': _$LivenessResponseDtoStatusEnumEnumMap[instance.status]!,
};

const _$LivenessResponseDtoStatusEnumEnumMap = {
  LivenessResponseDtoStatusEnum.ok: 'ok',
  LivenessResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
