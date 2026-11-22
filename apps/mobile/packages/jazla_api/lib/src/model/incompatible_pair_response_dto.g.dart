// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'incompatible_pair_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

IncompatiblePairResponseDto _$IncompatiblePairResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('IncompatiblePairResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['cuttingStyleId', 'packaging']);
  final val = IncompatiblePairResponseDto(
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecode(
        _$IncompatiblePairResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue:
            IncompatiblePairResponseDtoPackagingEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$IncompatiblePairResponseDtoToJson(
  IncompatiblePairResponseDto instance,
) => <String, dynamic>{
  'cuttingStyleId': instance.cuttingStyleId,
  'packaging':
      _$IncompatiblePairResponseDtoPackagingEnumEnumMap[instance.packaging]!,
};

const _$IncompatiblePairResponseDtoPackagingEnumEnumMap = {
  IncompatiblePairResponseDtoPackagingEnum.trays: 'trays',
  IncompatiblePairResponseDtoPackagingEnum.bags: 'bags',
  IncompatiblePairResponseDtoPackagingEnum.vacuum: 'vacuum',
  IncompatiblePairResponseDtoPackagingEnum.none: 'none',
  IncompatiblePairResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
