// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_summary_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderSummaryResponseDto _$OrderSummaryResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderSummaryResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'number',
      'status',
      'orderType',
      'fulfilment',
      'fulfilmentDate',
      'vendor',
      'customer',
      'paymentMethod',
      'totalHalalas',
      'createdAt',
    ],
  );
  final val = OrderSummaryResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    number: $checkedConvert('number', (v) => v as String),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$OrderStatusEnumMap,
        v,
        unknownValue: OrderStatus.unknownDefaultOpenApi,
      ),
    ),
    orderType: $checkedConvert(
      'orderType',
      (v) => $enumDecode(
        _$OrderTypeEnumMap,
        v,
        unknownValue: OrderType.unknownDefaultOpenApi,
      ),
    ),
    fulfilment: $checkedConvert(
      'fulfilment',
      (v) => $enumDecode(
        _$FulfilmentMethodEnumMap,
        v,
        unknownValue: FulfilmentMethod.unknownDefaultOpenApi,
      ),
    ),
    fulfilmentDate: $checkedConvert('fulfilmentDate', (v) => v as String),
    vendor: $checkedConvert(
      'vendor',
      (v) => OrderVendorResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    customer: $checkedConvert(
      'customer',
      (v) => OrderCustomerResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    paymentMethod: $checkedConvert(
      'paymentMethod',
      (v) => $enumDecode(
        _$PaymentMethodEnumMap,
        v,
        unknownValue: PaymentMethod.unknownDefaultOpenApi,
      ),
    ),
    totalHalalas: $checkedConvert('totalHalalas', (v) => (v as num).toInt()),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$OrderSummaryResponseDtoToJson(
  OrderSummaryResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'number': instance.number,
  'status': _$OrderStatusEnumMap[instance.status]!,
  'orderType': _$OrderTypeEnumMap[instance.orderType]!,
  'fulfilment': _$FulfilmentMethodEnumMap[instance.fulfilment]!,
  'fulfilmentDate': instance.fulfilmentDate,
  'vendor': instance.vendor.toJson(),
  'customer': instance.customer.toJson(),
  'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
  'totalHalalas': instance.totalHalalas,
  'createdAt': instance.createdAt.toIso8601String(),
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

const _$OrderTypeEnumMap = {
  OrderType.readyMeat: 'ready_meat',
  OrderType.carcass: 'carcass',
  OrderType.cooked: 'cooked',
  OrderType.occasion: 'occasion',
  OrderType.adha: 'adha',
  OrderType.mixed: 'mixed',
  OrderType.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$FulfilmentMethodEnumMap = {
  FulfilmentMethod.delivery: 'delivery',
  FulfilmentMethod.pickup: 'pickup',
  FulfilmentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.mada: 'mada',
  PaymentMethod.card: 'card',
  PaymentMethod.applepay: 'applepay',
  PaymentMethod.cod: 'cod',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};
