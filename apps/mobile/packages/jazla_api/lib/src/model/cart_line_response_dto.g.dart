// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_line_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartLineResponseDto _$CartLineResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartLineResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'productId',
      'name',
      'imageUrl',
      'size',
      'cutting',
      'packaging',
      'exclusions',
      'notes',
      'quantity',
      'unitPriceHalalas',
      'totalHalalas',
      'isAvailable',
    ],
  );
  final val = CartLineResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    productId: $checkedConvert('productId', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    imageUrl: $checkedConvert('imageUrl', (v) => v as String?),
    size: $checkedConvert(
      'size',
      (v) => OrderItemSizeResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    cutting: $checkedConvert(
      'cutting',
      (v) => v == null
          ? null
          : OrderOptionResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecodeNullable(
        _$CartLineResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue: CartLineResponseDtoPackagingEnum.unknownDefaultOpenApi,
      ),
    ),
    exclusions: $checkedConvert(
      'exclusions',
      (v) => (v as List<dynamic>)
          .map(
            (e) => OrderOptionResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    notes: $checkedConvert('notes', (v) => v as String?),
    quantity: $checkedConvert('quantity', (v) => (v as num).toInt()),
    unitPriceHalalas: $checkedConvert(
      'unitPriceHalalas',
      (v) => (v as num).toInt(),
    ),
    totalHalalas: $checkedConvert('totalHalalas', (v) => (v as num).toInt()),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$CartLineResponseDtoToJson(
  CartLineResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'productId': instance.productId,
  'name': instance.name.toJson(),
  'imageUrl': instance.imageUrl,
  'size': instance.size.toJson(),
  'cutting': instance.cutting?.toJson(),
  'packaging': _$CartLineResponseDtoPackagingEnumEnumMap[instance.packaging],
  'exclusions': instance.exclusions.map((e) => e.toJson()).toList(),
  'notes': instance.notes,
  'quantity': instance.quantity,
  'unitPriceHalalas': instance.unitPriceHalalas,
  'totalHalalas': instance.totalHalalas,
  'isAvailable': instance.isAvailable,
};

const _$CartLineResponseDtoPackagingEnumEnumMap = {
  CartLineResponseDtoPackagingEnum.trays: 'trays',
  CartLineResponseDtoPackagingEnum.bags: 'bags',
  CartLineResponseDtoPackagingEnum.vacuum: 'vacuum',
  CartLineResponseDtoPackagingEnum.none: 'none',
  CartLineResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
