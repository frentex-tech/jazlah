// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderResponseDto _$OrderResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderResponseDto', json, ($checkedConvert) {
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
      'items',
      'address',
      'pickupPoint',
      'window',
      'subtotalHalalas',
      'discountHalalas',
      'deliveryFeeHalalas',
      'vatHalalas',
      'couponCode',
      'notes',
      'cancelReason',
      'expiresAt',
      'payment',
      'refunds',
      'history',
      'allowedTransitions',
    ],
  );
  final val = OrderResponseDto(
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
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map((e) => OrderItemResponseDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    address: $checkedConvert(
      'address',
      (v) => v == null
          ? null
          : OrderAddressResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    pickupPoint: $checkedConvert(
      'pickupPoint',
      (v) => v == null
          ? null
          : PickupPointResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    window: $checkedConvert(
      'window',
      (v) =>
          v == null ? null : TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
    subtotalHalalas: $checkedConvert(
      'subtotalHalalas',
      (v) => (v as num).toInt(),
    ),
    discountHalalas: $checkedConvert(
      'discountHalalas',
      (v) => (v as num).toInt(),
    ),
    deliveryFeeHalalas: $checkedConvert(
      'deliveryFeeHalalas',
      (v) => (v as num).toInt(),
    ),
    vatHalalas: $checkedConvert('vatHalalas', (v) => (v as num).toInt()),
    couponCode: $checkedConvert('couponCode', (v) => v as String?),
    notes: $checkedConvert('notes', (v) => v as String?),
    cancelReason: $checkedConvert('cancelReason', (v) => v as String?),
    expiresAt: $checkedConvert(
      'expiresAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    payment: $checkedConvert(
      'payment',
      (v) => OrderPaymentSummaryResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    refunds: $checkedConvert(
      'refunds',
      (v) => (v as List<dynamic>)
          .map(
            (e) => OrderRefundResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    history: $checkedConvert(
      'history',
      (v) => (v as List<dynamic>)
          .map(
            (e) => OrderHistoryEntryResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    allowedTransitions: $checkedConvert(
      'allowedTransitions',
      (v) => (v as List<dynamic>)
          .map((e) => $enumDecode(_$OrderStatusEnumMap, e))
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$OrderResponseDtoToJson(OrderResponseDto instance) =>
    <String, dynamic>{
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
      'items': instance.items.map((e) => e.toJson()).toList(),
      'address': instance.address?.toJson(),
      'pickupPoint': instance.pickupPoint?.toJson(),
      'window': instance.window?.toJson(),
      'subtotalHalalas': instance.subtotalHalalas,
      'discountHalalas': instance.discountHalalas,
      'deliveryFeeHalalas': instance.deliveryFeeHalalas,
      'vatHalalas': instance.vatHalalas,
      'couponCode': instance.couponCode,
      'notes': instance.notes,
      'cancelReason': instance.cancelReason,
      'expiresAt': instance.expiresAt?.toIso8601String(),
      'payment': instance.payment.toJson(),
      'refunds': instance.refunds.map((e) => e.toJson()).toList(),
      'history': instance.history.map((e) => e.toJson()).toList(),
      'allowedTransitions': instance.allowedTransitions
          .map((e) => _$OrderStatusEnumMap[e]!)
          .toList(),
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
