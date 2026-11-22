// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_cart_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AddCartItemDto _$AddCartItemDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('AddCartItemDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['productId', 'sizeId', 'quantity']);
      final val = AddCartItemDto(
        productId: $checkedConvert('productId', (v) => v as String),
        sizeId: $checkedConvert('sizeId', (v) => v as String),
        cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String?),
        packaging: $checkedConvert(
          'packaging',
          (v) => $enumDecodeNullable(
            _$AddCartItemDtoPackagingEnumEnumMap,
            v,
            unknownValue: AddCartItemDtoPackagingEnum.unknownDefaultOpenApi,
          ),
        ),
        exclusionItemIds: $checkedConvert(
          'exclusionItemIds',
          (v) => (v as List<dynamic>?)?.map((e) => e as String).toList(),
        ),
        notes: $checkedConvert('notes', (v) => v as String?),
        quantity: $checkedConvert('quantity', (v) => (v as num).toInt()),
        replaceCart: $checkedConvert('replaceCart', (v) => v as bool?),
      );
      return val;
    });

Map<String, dynamic> _$AddCartItemDtoToJson(AddCartItemDto instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'sizeId': instance.sizeId,
      'cuttingStyleId': ?instance.cuttingStyleId,
      'packaging': ?_$AddCartItemDtoPackagingEnumEnumMap[instance.packaging],
      'exclusionItemIds': ?instance.exclusionItemIds,
      'notes': ?instance.notes,
      'quantity': instance.quantity,
      'replaceCart': ?instance.replaceCart,
    };

const _$AddCartItemDtoPackagingEnumEnumMap = {
  AddCartItemDtoPackagingEnum.trays: 'trays',
  AddCartItemDtoPackagingEnum.bags: 'bags',
  AddCartItemDtoPackagingEnum.vacuum: 'vacuum',
  AddCartItemDtoPackagingEnum.none: 'none',
  AddCartItemDtoPackagingEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
