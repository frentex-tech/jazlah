// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_history_entry_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderHistoryEntryResponseDto _$OrderHistoryEntryResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderHistoryEntryResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['from', 'to', 'actorType', 'note', 'at'],
  );
  final val = OrderHistoryEntryResponseDto(
    from: $checkedConvert(
      'from',
      (v) => $enumDecodeNullable(
        _$OrderStatusEnumMap,
        v,
        unknownValue: OrderStatus.unknownDefaultOpenApi,
      ),
    ),
    to: $checkedConvert(
      'to',
      (v) => $enumDecode(
        _$OrderStatusEnumMap,
        v,
        unknownValue: OrderStatus.unknownDefaultOpenApi,
      ),
    ),
    actorType: $checkedConvert(
      'actorType',
      (v) => $enumDecode(
        _$OrderHistoryEntryResponseDtoActorTypeEnumEnumMap,
        v,
        unknownValue:
            OrderHistoryEntryResponseDtoActorTypeEnum.unknownDefaultOpenApi,
      ),
    ),
    note: $checkedConvert('note', (v) => v as String?),
    at: $checkedConvert('at', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$OrderHistoryEntryResponseDtoToJson(
  OrderHistoryEntryResponseDto instance,
) => <String, dynamic>{
  'from': _$OrderStatusEnumMap[instance.from],
  'to': _$OrderStatusEnumMap[instance.to]!,
  'actorType':
      _$OrderHistoryEntryResponseDtoActorTypeEnumEnumMap[instance.actorType]!,
  'note': instance.note,
  'at': instance.at.toIso8601String(),
};

const _$OrderStatusEnumMap = {
  OrderStatus.pendingPayment: 'pending_payment',
  OrderStatus.new_: 'new',
  OrderStatus.confirmed: 'confirmed',
  OrderStatus.preparing: 'preparing',
  OrderStatus.ready: 'ready',
  OrderStatus.pickedUp: 'picked_up',
  OrderStatus.outForDelivery: 'out_for_delivery',
  OrderStatus.delivered: 'delivered',
  OrderStatus.collected: 'collected',
  OrderStatus.cancelled: 'cancelled',
  OrderStatus.deliveryFailed: 'delivery_failed',
  OrderStatus.returned: 'returned',
  OrderStatus.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$OrderHistoryEntryResponseDtoActorTypeEnumEnumMap = {
  OrderHistoryEntryResponseDtoActorTypeEnum.system: 'system',
  OrderHistoryEntryResponseDtoActorTypeEnum.customer: 'customer',
  OrderHistoryEntryResponseDtoActorTypeEnum.admin: 'admin',
  OrderHistoryEntryResponseDtoActorTypeEnum.vendor: 'vendor',
  OrderHistoryEntryResponseDtoActorTypeEnum.kitchen: 'kitchen',
  OrderHistoryEntryResponseDtoActorTypeEnum.delivery: 'delivery',
  OrderHistoryEntryResponseDtoActorTypeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
