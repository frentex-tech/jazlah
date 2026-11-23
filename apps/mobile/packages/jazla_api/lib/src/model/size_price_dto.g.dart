// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'size_price_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SizePriceDto _$SizePriceDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('SizePriceDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['sizeId', 'priceHalalas']);
      final val = SizePriceDto(
        sizeId: $checkedConvert('sizeId', (v) => v as String),
        priceHalalas: $checkedConvert('priceHalalas', (v) => v as num),
      );
      return val;
    });

Map<String, dynamic> _$SizePriceDtoToJson(SizePriceDto instance) =>
    <String, dynamic>{
      'sizeId': instance.sizeId,
      'priceHalalas': instance.priceHalalas,
    };
