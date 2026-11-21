// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'media_file_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MediaFileResponseDto _$MediaFileResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('MediaFileResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'purpose',
      'visibility',
      'status',
      'sizeBytes',
      'contentType',
      'originalFileName',
      'confirmedAt',
    ],
  );
  final val = MediaFileResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    purpose: $checkedConvert('purpose', (v) => v as String),
    visibility: $checkedConvert(
      'visibility',
      (v) => $enumDecode(
        _$MediaFileResponseDtoVisibilityEnumEnumMap,
        v,
        unknownValue: MediaFileResponseDtoVisibilityEnum.unknownDefaultOpenApi,
      ),
    ),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$MediaFileResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: MediaFileResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    sizeBytes: $checkedConvert('sizeBytes', (v) => (v as num).toInt()),
    contentType: $checkedConvert('contentType', (v) => v as String),
    originalFileName: $checkedConvert('originalFileName', (v) => v as String?),
    confirmedAt: $checkedConvert(
      'confirmedAt',
      (v) => DateTime.parse(v as String),
    ),
  );
  return val;
});

Map<String, dynamic> _$MediaFileResponseDtoToJson(
  MediaFileResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'purpose': instance.purpose,
  'visibility':
      _$MediaFileResponseDtoVisibilityEnumEnumMap[instance.visibility]!,
  'status': _$MediaFileResponseDtoStatusEnumEnumMap[instance.status]!,
  'sizeBytes': instance.sizeBytes,
  'contentType': instance.contentType,
  'originalFileName': instance.originalFileName,
  'confirmedAt': instance.confirmedAt.toIso8601String(),
};

const _$MediaFileResponseDtoVisibilityEnumEnumMap = {
  MediaFileResponseDtoVisibilityEnum.public: 'public',
  MediaFileResponseDtoVisibilityEnum.private: 'private',
  MediaFileResponseDtoVisibilityEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$MediaFileResponseDtoStatusEnumEnumMap = {
  MediaFileResponseDtoStatusEnum.ready: 'ready',
  MediaFileResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
