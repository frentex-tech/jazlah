// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_content_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductContentDto _$ProductContentDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ProductContentDto', json, ($checkedConvert) {
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
        ],
      );
      final val = ProductContentDto(
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
      );
      return val;
    });

Map<String, dynamic> _$ProductContentDtoToJson(ProductContentDto instance) =>
    <String, dynamic>{
      'name': instance.name.toJson(),
      'description': ?instance.description?.toJson(),
      'categoryId': instance.categoryId,
      'meatTypeId': ?instance.meatTypeId,
      'imageMediaIds': instance.imageMediaIds,
      'sizes': instance.sizes.map((e) => e.toJson()).toList(),
      'cuttings': instance.cuttings.map((e) => e.toJson()).toList(),
      'packagings': instance.packagings.map((e) => e.toJson()).toList(),
      'exclusionItemIds': instance.exclusionItemIds,
    };
