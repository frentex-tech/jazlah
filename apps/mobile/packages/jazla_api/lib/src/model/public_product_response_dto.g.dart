// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_product_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicProductResponseDto _$PublicProductResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicProductResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'vendor',
      'name',
      'description',
      'category',
      'meatType',
      'fulfilment',
      'isAvailable',
      'images',
      'sizes',
      'defaultSizeId',
      'cuttings',
      'packagings',
      'exclusions',
      'incompatiblePairs',
      'minPriceHalalas',
    ],
  );
  final val = PublicProductResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    vendor: $checkedConvert(
      'vendor',
      (v) => ProductVendorResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) =>
          OptionalLocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    category: $checkedConvert(
      'category',
      (v) => NamedReferenceResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    meatType: $checkedConvert(
      'meatType',
      (v) => v == null
          ? null
          : NamedReferenceResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    fulfilment: $checkedConvert(
      'fulfilment',
      (v) => $enumDecode(
        _$PublicProductResponseDtoFulfilmentEnumEnumMap,
        v,
        unknownValue:
            PublicProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi,
      ),
    ),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    images: $checkedConvert(
      'images',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ProductImageResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    sizes: $checkedConvert(
      'sizes',
      (v) => (v as List<dynamic>)
          .map(
            (e) => PublicProductSizeResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    defaultSizeId: $checkedConvert('defaultSizeId', (v) => v as String?),
    cuttings: $checkedConvert(
      'cuttings',
      (v) => (v as List<dynamic>)
          .map(
            (e) => PublicProductCuttingResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    packagings: $checkedConvert(
      'packagings',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                ProductPackagingResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    exclusions: $checkedConvert(
      'exclusions',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                NamedReferenceResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    incompatiblePairs: $checkedConvert(
      'incompatiblePairs',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                IncompatiblePairResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    minPriceHalalas: $checkedConvert('minPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$PublicProductResponseDtoToJson(
  PublicProductResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'vendor': instance.vendor.toJson(),
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'category': instance.category.toJson(),
  'meatType': instance.meatType?.toJson(),
  'fulfilment':
      _$PublicProductResponseDtoFulfilmentEnumEnumMap[instance.fulfilment]!,
  'isAvailable': instance.isAvailable,
  'images': instance.images.map((e) => e.toJson()).toList(),
  'sizes': instance.sizes.map((e) => e.toJson()).toList(),
  'defaultSizeId': instance.defaultSizeId,
  'cuttings': instance.cuttings.map((e) => e.toJson()).toList(),
  'packagings': instance.packagings.map((e) => e.toJson()).toList(),
  'exclusions': instance.exclusions.map((e) => e.toJson()).toList(),
  'incompatiblePairs': instance.incompatiblePairs
      .map((e) => e.toJson())
      .toList(),
  'minPriceHalalas': instance.minPriceHalalas,
};

const _$PublicProductResponseDtoFulfilmentEnumEnumMap = {
  PublicProductResponseDtoFulfilmentEnum.delivery: 'delivery',
  PublicProductResponseDtoFulfilmentEnum.pickup: 'pickup',
  PublicProductResponseDtoFulfilmentEnum.both: 'both',
  PublicProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
