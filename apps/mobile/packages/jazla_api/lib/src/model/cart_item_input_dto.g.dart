// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_item_input_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartItemInputDto _$CartItemInputDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CartItemInputDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['productId', 'sizeId', 'quantity']);
      final val = CartItemInputDto(
        productId: $checkedConvert('productId', (v) => v as String),
        sizeId: $checkedConvert('sizeId', (v) => v as String),
        cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String?),
        packaging: $checkedConvert(
          'packaging',
          (v) => $enumDecodeNullable(
            _$CartItemInputDtoPackagingEnumEnumMap,
            v,
            unknownValue: CartItemInputDtoPackagingEnum.unknownDefaultOpenApi,
          ),
        ),
        exclusionItemIds: $checkedConvert(
          'exclusionItemIds',
          (v) => (v as List<dynamic>?)?.map((e) => e as String).toList(),
        ),
        notes: $checkedConvert('notes', (v) => v as String?),
        quantity: $checkedConvert('quantity', (v) => (v as num).toInt()),
      );
      return val;
    });

Map<String, dynamic> _$CartItemInputDtoToJson(CartItemInputDto instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'sizeId': instance.sizeId,
      'cuttingStyleId': ?instance.cuttingStyleId,
      'packaging': ?_$CartItemInputDtoPackagingEnumEnumMap[instance.packaging],
      'exclusionItemIds': ?instance.exclusionItemIds,
      'notes': ?instance.notes,
      'quantity': instance.quantity,
    };

const _$CartItemInputDtoPackagingEnumEnumMap = {
  CartItemInputDtoPackagingEnum.trays: 'trays',
  CartItemInputDtoPackagingEnum.bags: 'bags',
  CartItemInputDtoPackagingEnum.vacuum: 'vacuum',
  CartItemInputDtoPackagingEnum.none: 'none',
  CartItemInputDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
