// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_packaging_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductPackagingDto _$ProductPackagingDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductPackagingDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['packaging', 'extraPriceHalalas']);
  final val = ProductPackagingDto(
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecode(
        _$ProductPackagingDtoPackagingEnumEnumMap,
        v,
        unknownValue: ProductPackagingDtoPackagingEnum.unknownDefaultOpenApi,
      ),
    ),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$ProductPackagingDtoToJson(
  ProductPackagingDto instance,
) => <String, dynamic>{
  'packaging': _$ProductPackagingDtoPackagingEnumEnumMap[instance.packaging]!,
  'extraPriceHalalas': instance.extraPriceHalalas,
};

const _$ProductPackagingDtoPackagingEnumEnumMap = {
  ProductPackagingDtoPackagingEnum.trays: 'trays',
  ProductPackagingDtoPackagingEnum.bags: 'bags',
  ProductPackagingDtoPackagingEnum.vacuum: 'vacuum',
  ProductPackagingDtoPackagingEnum.none: 'none',
  ProductPackagingDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
