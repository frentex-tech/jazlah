// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_tokens_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthTokensResponseDto _$AuthTokensResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('AuthTokensResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'accessToken',
      'accessTokenExpiresInSeconds',
      'refreshToken',
      'refreshTokenExpiresInSeconds',
    ],
  );
  final val = AuthTokensResponseDto(
    accessToken: $checkedConvert('accessToken', (v) => v as String),
    accessTokenExpiresInSeconds: $checkedConvert(
      'accessTokenExpiresInSeconds',
      (v) => v as num,
    ),
    refreshToken: $checkedConvert('refreshToken', (v) => v as String),
    refreshTokenExpiresInSeconds: $checkedConvert(
      'refreshTokenExpiresInSeconds',
      (v) => v as num,
    ),
  );
  return val;
});

Map<String, dynamic> _$AuthTokensResponseDtoToJson(
  AuthTokensResponseDto instance,
) => <String, dynamic>{
  'accessToken': instance.accessToken,
  'accessTokenExpiresInSeconds': instance.accessTokenExpiresInSeconds,
  'refreshToken': instance.refreshToken,
  'refreshTokenExpiresInSeconds': instance.refreshTokenExpiresInSeconds,
};
