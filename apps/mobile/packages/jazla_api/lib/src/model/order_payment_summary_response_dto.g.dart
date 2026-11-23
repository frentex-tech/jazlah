// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_payment_summary_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderPaymentSummaryResponseDto _$OrderPaymentSummaryResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderPaymentSummaryResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'method',
      'status',
      'paymentId',
      'walletHalalas',
      'walletRestoredHalalas',
      'cardLast4',
    ],
  );
  final val = OrderPaymentSummaryResponseDto(
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(
        _$PaymentMethodEnumMap,
        v,
        unknownValue: PaymentMethod.unknownDefaultOpenApi,
      ),
    ),
    status: $checkedConvert(
      'status',
      (v) => $enumDecodeNullable(
        _$PaymentStatusEnumMap,
        v,
        unknownValue: PaymentStatus.unknownDefaultOpenApi,
      ),
    ),
    paymentId: $checkedConvert('paymentId', (v) => v as String?),
    walletHalalas: $checkedConvert('walletHalalas', (v) => (v as num).toInt()),
    walletRestoredHalalas: $checkedConvert(
      'walletRestoredHalalas',
      (v) => (v as num).toInt(),
    ),
    cardLast4: $checkedConvert('cardLast4', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$OrderPaymentSummaryResponseDtoToJson(
  OrderPaymentSummaryResponseDto instance,
) => <String, dynamic>{
  'method': _$PaymentMethodEnumMap[instance.method]!,
  'status': _$PaymentStatusEnumMap[instance.status],
  'paymentId': instance.paymentId,
  'walletHalalas': instance.walletHalalas,
  'walletRestoredHalalas': instance.walletRestoredHalalas,
  'cardLast4': instance.cardLast4,
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.mada: 'mada',
  PaymentMethod.card: 'card',
  PaymentMethod.applepay: 'applepay',
  PaymentMethod.cod: 'cod',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$PaymentStatusEnumMap = {
  PaymentStatus.initiated: 'initiated',
  PaymentStatus.authorized: 'authorized',
  PaymentStatus.captured: 'captured',
  PaymentStatus.failed: 'failed',
  PaymentStatus.cancelled: 'cancelled',
  PaymentStatus.refunded: 'refunded',
  PaymentStatus.partiallyRefunded: 'partially_refunded',
  PaymentStatus.unknownDefaultOpenApi: 'unknown_default_open_api',
};
