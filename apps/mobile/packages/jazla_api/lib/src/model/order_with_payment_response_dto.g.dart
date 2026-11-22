// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_with_payment_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderWithPaymentResponseDto _$OrderWithPaymentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderWithPaymentResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['order', 'payment']);
  final val = OrderWithPaymentResponseDto(
    order: $checkedConvert(
      'order',
      (v) => OrderResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    payment: $checkedConvert(
      'payment',
      (v) => v == null
          ? null
          : PaymentResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$OrderWithPaymentResponseDtoToJson(
  OrderWithPaymentResponseDto instance,
) => <String, dynamic>{
  'order': instance.order.toJson(),
  'payment': instance.payment?.toJson(),
};
