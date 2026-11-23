// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_item_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderItemResponseDto _$OrderItemResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderItemResponseDto', json, ($checkedConvert) {
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
    ],
  );
  final val = OrderItemResponseDto(
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
        _$OrderItemResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue: OrderItemResponseDtoPackagingEnum.unknownDefaultOpenApi,
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
  );
  return val;
});

Map<String, dynamic> _$OrderItemResponseDtoToJson(
  OrderItemResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'productId': instance.productId,
  'name': instance.name.toJson(),
  'imageUrl': instance.imageUrl,
  'size': instance.size.toJson(),
  'cutting': instance.cutting?.toJson(),
  'packaging': _$OrderItemResponseDtoPackagingEnumEnumMap[instance.packaging],
  'exclusions': instance.exclusions.map((e) => e.toJson()).toList(),
  'notes': instance.notes,
  'quantity': instance.quantity,
  'unitPriceHalalas': instance.unitPriceHalalas,
  'totalHalalas': instance.totalHalalas,
};

const _$OrderItemResponseDtoPackagingEnumEnumMap = {
  OrderItemResponseDtoPackagingEnum.trays: 'trays',
  OrderItemResponseDtoPackagingEnum.bags: 'bags',
  OrderItemResponseDtoPackagingEnum.vacuum: 'vacuum',
  OrderItemResponseDtoPackagingEnum.none: 'none',
  OrderItemResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
