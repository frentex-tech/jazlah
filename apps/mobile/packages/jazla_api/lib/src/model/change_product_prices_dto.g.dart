// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_product_prices_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChangeProductPricesDto _$ChangeProductPricesDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ChangeProductPricesDto', json, ($checkedConvert) {
  final val = ChangeProductPricesDto(
    sizes: $checkedConvert(
      'sizes',
      (v) => (v as List<dynamic>?)
          ?.map((e) => SizePriceDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    cuttings: $checkedConvert(
      'cuttings',
      (v) => (v as List<dynamic>?)
          ?.map((e) => CuttingPriceDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    packagings: $checkedConvert(
      'packagings',
      (v) => (v as List<dynamic>?)
          ?.map((e) => PackagingPriceDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$ChangeProductPricesDtoToJson(
  ChangeProductPricesDto instance,
) => <String, dynamic>{
  'sizes': ?instance.sizes?.map((e) => e.toJson()).toList(),
  'cuttings': ?instance.cuttings?.map((e) => e.toJson()).toList(),
  'packagings': ?instance.packagings?.map((e) => e.toJson()).toList(),
};
