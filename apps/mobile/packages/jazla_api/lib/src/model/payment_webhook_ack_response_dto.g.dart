// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_webhook_ack_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentWebhookAckResponseDto _$PaymentWebhookAckResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentWebhookAckResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['received']);
  final val = PaymentWebhookAckResponseDto(
    received: $checkedConvert('received', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$PaymentWebhookAckResponseDtoToJson(
  PaymentWebhookAckResponseDto instance,
) => <String, dynamic>{'received': instance.received};
