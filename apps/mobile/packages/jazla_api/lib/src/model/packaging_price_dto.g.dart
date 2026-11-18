// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'packaging_price_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PackagingPriceDto _$PackagingPriceDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('PackagingPriceDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['packaging', 'extraPriceHalalas']);
      final val = PackagingPriceDto(
        packaging: $checkedConvert(
          'packaging',
          (v) => $enumDecode(
            _$PackagingPriceDtoPackagingEnumEnumMap,
            v,
            unknownValue: PackagingPriceDtoPackagingEnum.unknownDefaultOpenApi,
          ),
        ),
        extraPriceHalalas: $checkedConvert(
          'extraPriceHalalas',
          (v) => v as num,
        ),
      );
      return val;
    });

Map<String, dynamic> _$PackagingPriceDtoToJson(PackagingPriceDto instance) =>
    <String, dynamic>{
      'packaging': _$PackagingPriceDtoPackagingEnumEnumMap[instance.packaging]!,
      'extraPriceHalalas': instance.extraPriceHalalas,
    };

const _$PackagingPriceDtoPackagingEnumEnumMap = {
  PackagingPriceDtoPackagingEnum.trays: 'trays',
  PackagingPriceDtoPackagingEnum.bags: 'bags',
  PackagingPriceDtoPackagingEnum.vacuum: 'vacuum',
  PackagingPriceDtoPackagingEnum.none: 'none',
  PackagingPriceDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
