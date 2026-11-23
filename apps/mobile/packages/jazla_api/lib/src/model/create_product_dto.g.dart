// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_product_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateProductDto _$CreateProductDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CreateProductDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const [
          'name',
          'categoryId',
          'imageMediaIds',
          'sizes',
          'cuttings',
          'packagings',
          'exclusionItemIds',
          'fulfilment',
        ],
      );
      final val = CreateProductDto(
        name: $checkedConvert(
          'name',
          (v) => LocalizedNameDto.fromJson(v as Map<String, dynamic>),
        ),
        description: $checkedConvert(
          'description',
          (v) => v == null
              ? null
              : LocalizedDescriptionDto.fromJson(v as Map<String, dynamic>),
        ),
        categoryId: $checkedConvert('categoryId', (v) => v as String),
        meatTypeId: $checkedConvert('meatTypeId', (v) => v as String?),
        imageMediaIds: $checkedConvert(
          'imageMediaIds',
          (v) => (v as List<dynamic>).map((e) => e as String).toList(),
        ),
        sizes: $checkedConvert(
          'sizes',
          (v) => (v as List<dynamic>)
              .map((e) => ProductSizeDto.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        cuttings: $checkedConvert(
          'cuttings',
          (v) => (v as List<dynamic>)
              .map((e) => ProductCuttingDto.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
        packagings: $checkedConvert(
          'packagings',
          (v) => (v as List<dynamic>)
              .map(
                (e) => ProductPackagingDto.fromJson(e as Map<String, dynamic>),
              )
              .toList(),
        ),
        exclusionItemIds: $checkedConvert(
          'exclusionItemIds',
          (v) => (v as List<dynamic>).map((e) => e as String).toList(),
        ),
        fulfilment: $checkedConvert(
          'fulfilment',
          (v) => $enumDecode(
            _$CreateProductDtoFulfilmentEnumEnumMap,
            v,
            unknownValue: CreateProductDtoFulfilmentEnum.unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CreateProductDtoToJson(
  CreateProductDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'description': ?instance.description?.toJson(),
  'categoryId': instance.categoryId,
  'meatTypeId': ?instance.meatTypeId,
  'imageMediaIds': instance.imageMediaIds,
  'sizes': instance.sizes.map((e) => e.toJson()).toList(),
  'cuttings': instance.cuttings.map((e) => e.toJson()).toList(),
  'packagings': instance.packagings.map((e) => e.toJson()).toList(),
  'exclusionItemIds': instance.exclusionItemIds,
  'fulfilment': _$CreateProductDtoFulfilmentEnumEnumMap[instance.fulfilment]!,
};

const _$CreateProductDtoFulfilmentEnumEnumMap = {
  CreateProductDtoFulfilmentEnum.delivery: 'delivery',
  CreateProductDtoFulfilmentEnum.pickup: 'pickup',
  CreateProductDtoFulfilmentEnum.both: 'both',
  CreateProductDtoFulfilmentEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
