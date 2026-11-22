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
        _$OrderPaymentSummaryResponseDtoMethodEnumEnumMap,
        v,
        unknownValue:
            OrderPaymentSummaryResponseDtoMethodEnum.unknownDefaultOpenApi,
      ),
    ),
    status: $checkedConvert(
      'status',
      (v) => $enumDecodeNullable(
        _$OrderPaymentSummaryResponseDtoStatusEnumEnumMap,
        v,
        unknownValue:
            OrderPaymentSummaryResponseDtoStatusEnum.unknownDefaultOpenApi,
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
  'method': _$OrderPaymentSummaryResponseDtoMethodEnumEnumMap[instance.method]!,
  'status': _$OrderPaymentSummaryResponseDtoStatusEnumEnumMap[instance.status],
  'paymentId': instance.paymentId,
  'walletHalalas': instance.walletHalalas,
  'walletRestoredHalalas': instance.walletRestoredHalalas,
  'cardLast4': instance.cardLast4,
};

const _$OrderPaymentSummaryResponseDtoMethodEnumEnumMap = {
  OrderPaymentSummaryResponseDtoMethodEnum.mada: 'mada',
  OrderPaymentSummaryResponseDtoMethodEnum.card: 'card',
  OrderPaymentSummaryResponseDtoMethodEnum.applepay: 'applepay',
  OrderPaymentSummaryResponseDtoMethodEnum.cod: 'cod',
  OrderPaymentSummaryResponseDtoMethodEnum.wallet: 'wallet',
  OrderPaymentSummaryResponseDtoMethodEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$OrderPaymentSummaryResponseDtoStatusEnumEnumMap = {
  OrderPaymentSummaryResponseDtoStatusEnum.initiated: 'initiated',
  OrderPaymentSummaryResponseDtoStatusEnum.authorized: 'authorized',
  OrderPaymentSummaryResponseDtoStatusEnum.captured: 'captured',
  OrderPaymentSummaryResponseDtoStatusEnum.failed: 'failed',
  OrderPaymentSummaryResponseDtoStatusEnum.cancelled: 'cancelled',
  OrderPaymentSummaryResponseDtoStatusEnum.refunded: 'refunded',
  OrderPaymentSummaryResponseDtoStatusEnum.partiallyRefunded:
      'partially_refunded',
  OrderPaymentSummaryResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
