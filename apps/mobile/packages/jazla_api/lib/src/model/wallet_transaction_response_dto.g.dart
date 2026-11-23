// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_transaction_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletTransactionResponseDto _$WalletTransactionResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('WalletTransactionResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'kind',
      'amountHalalas',
      'balanceAfterHalalas',
      'orderId',
      'note',
      'createdAt',
    ],
  );
  final val = WalletTransactionResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    kind: $checkedConvert(
      'kind',
      (v) => $enumDecode(
        _$WalletTransactionResponseDtoKindEnumEnumMap,
        v,
        unknownValue:
            WalletTransactionResponseDtoKindEnum.unknownDefaultOpenApi,
      ),
    ),
    amountHalalas: $checkedConvert('amountHalalas', (v) => (v as num).toInt()),
    balanceAfterHalalas: $checkedConvert(
      'balanceAfterHalalas',
      (v) => (v as num).toInt(),
    ),
    orderId: $checkedConvert('orderId', (v) => v as String?),
    note: $checkedConvert('note', (v) => v as String?),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$WalletTransactionResponseDtoToJson(
  WalletTransactionResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'kind': _$WalletTransactionResponseDtoKindEnumEnumMap[instance.kind]!,
  'amountHalalas': instance.amountHalalas,
  'balanceAfterHalalas': instance.balanceAfterHalalas,
  'orderId': instance.orderId,
  'note': instance.note,
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$WalletTransactionResponseDtoKindEnumEnumMap = {
  WalletTransactionResponseDtoKindEnum.adminCredit: 'admin_credit',
  WalletTransactionResponseDtoKindEnum.adminDebit: 'admin_debit',
  WalletTransactionResponseDtoKindEnum.orderPayment: 'order_payment',
  WalletTransactionResponseDtoKindEnum.paymentRestored: 'payment_restored',
  WalletTransactionResponseDtoKindEnum.orderRefund: 'order_refund',
  WalletTransactionResponseDtoKindEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
