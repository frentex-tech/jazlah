// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentResponseDto _$PaymentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'method',
      'status',
      'amountHalalas',
      'nextAction',
      'createdAt',
    ],
  );
  final val = PaymentResponseDto(
    id: $checkedConvert('id', (v) => v as String),
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
      (v) => $enumDecode(
        _$PaymentStatusEnumMap,
        v,
        unknownValue: PaymentStatus.unknownDefaultOpenApi,
      ),
    ),
    amountHalalas: $checkedConvert('amountHalalas', (v) => (v as num).toInt()),
    nextAction: $checkedConvert(
      'nextAction',
      (v) => v == null
          ? null
          : PaymentNextActionResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$PaymentResponseDtoToJson(PaymentResponseDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'method': _$PaymentMethodEnumMap[instance.method]!,
      'status': _$PaymentStatusEnumMap[instance.status]!,
      'amountHalalas': instance.amountHalalas,
      'nextAction': instance.nextAction?.toJson(),
      'createdAt': instance.createdAt.toIso8601String(),
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
