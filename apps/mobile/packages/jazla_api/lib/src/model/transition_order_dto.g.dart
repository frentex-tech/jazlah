// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'transition_order_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TransitionOrderDto _$TransitionOrderDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('TransitionOrderDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['to']);
      final val = TransitionOrderDto(
        to: $checkedConvert(
          'to',
          (v) => $enumDecode(
            _$OrderStatusEnumMap,
            v,
            unknownValue: OrderStatus.unknownDefaultOpenApi,
          ),
        ),
        note: $checkedConvert('note', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$TransitionOrderDtoToJson(TransitionOrderDto instance) =>
    <String, dynamic>{
      'to': _$OrderStatusEnumMap[instance.to]!,
      'note': ?instance.note,
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
