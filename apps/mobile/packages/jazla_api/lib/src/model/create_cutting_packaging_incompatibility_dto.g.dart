// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_cutting_packaging_incompatibility_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateCuttingPackagingIncompatibilityDto
_$CreateCuttingPackagingIncompatibilityDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CreateCuttingPackagingIncompatibilityDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(json, requiredKeys: const ['cuttingStyleId', 'packaging']);
      final val = CreateCuttingPackagingIncompatibilityDto(
        cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
        packaging: $checkedConvert(
          'packaging',
          (v) => $enumDecode(
            _$CreateCuttingPackagingIncompatibilityDtoPackagingEnumEnumMap,
            v,
            unknownValue: CreateCuttingPackagingIncompatibilityDtoPackagingEnum
                .unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CreateCuttingPackagingIncompatibilityDtoToJson(
  CreateCuttingPackagingIncompatibilityDto instance,
) => <String, dynamic>{
  'cuttingStyleId': instance.cuttingStyleId,
  'packaging':
      _$CreateCuttingPackagingIncompatibilityDtoPackagingEnumEnumMap[instance
          .packaging]!,
};

const _$CreateCuttingPackagingIncompatibilityDtoPackagingEnumEnumMap = {
  CreateCuttingPackagingIncompatibilityDtoPackagingEnum.trays: 'trays',
  CreateCuttingPackagingIncompatibilityDtoPackagingEnum.bags: 'bags',
  CreateCuttingPackagingIncompatibilityDtoPackagingEnum.vacuum: 'vacuum',
  CreateCuttingPackagingIncompatibilityDtoPackagingEnum.none: 'none',
  CreateCuttingPackagingIncompatibilityDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
