// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'otp_requested_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OtpRequestedResponseDto _$OtpRequestedResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OtpRequestedResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['expiresInSeconds', 'resendAfterSeconds'],
  );
  final val = OtpRequestedResponseDto(
    expiresInSeconds: $checkedConvert('expiresInSeconds', (v) => v as num),
    resendAfterSeconds: $checkedConvert('resendAfterSeconds', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$OtpRequestedResponseDtoToJson(
  OtpRequestedResponseDto instance,
) => <String, dynamic>{
  'expiresInSeconds': instance.expiresInSeconds,
  'resendAfterSeconds': instance.resendAfterSeconds,
};
