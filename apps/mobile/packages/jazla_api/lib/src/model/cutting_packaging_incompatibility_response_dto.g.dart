// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cutting_packaging_incompatibility_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CuttingPackagingIncompatibilityResponseDto
_$CuttingPackagingIncompatibilityResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CuttingPackagingIncompatibilityResponseDto', json, (
  $checkedConvert,
) {
  $checkKeys(
    json,
    requiredKeys: const ['id', 'cuttingStyleId', 'packaging', 'createdAt'],
  );
  final val = CuttingPackagingIncompatibilityResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecode(
        _$CuttingPackagingIncompatibilityResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue: CuttingPackagingIncompatibilityResponseDtoPackagingEnum
            .unknownDefaultOpenApi,
      ),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$CuttingPackagingIncompatibilityResponseDtoToJson(
  CuttingPackagingIncompatibilityResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'cuttingStyleId': instance.cuttingStyleId,
  'packaging':
      _$CuttingPackagingIncompatibilityResponseDtoPackagingEnumEnumMap[instance
          .packaging]!,
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$CuttingPackagingIncompatibilityResponseDtoPackagingEnumEnumMap = {
  CuttingPackagingIncompatibilityResponseDtoPackagingEnum.trays: 'trays',
  CuttingPackagingIncompatibilityResponseDtoPackagingEnum.bags: 'bags',
  CuttingPackagingIncompatibilityResponseDtoPackagingEnum.vacuum: 'vacuum',
  CuttingPackagingIncompatibilityResponseDtoPackagingEnum.none: 'none',
  CuttingPackagingIncompatibilityResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
