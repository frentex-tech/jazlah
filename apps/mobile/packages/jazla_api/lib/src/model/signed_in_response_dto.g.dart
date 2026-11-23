// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'signed_in_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SignedInResponseDto _$SignedInResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('SignedInResponseDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const [
          'accessToken',
          'accessTokenExpiresInSeconds',
          'refreshToken',
          'refreshTokenExpiresInSeconds',
          'principal',
          'profileComplete',
        ],
      );
      final val = SignedInResponseDto(
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
        principal: $checkedConvert(
          'principal',
          (v) => PrincipalResponseDto.fromJson(v as Map<String, dynamic>),
        ),
        profileComplete: $checkedConvert('profileComplete', (v) => v as bool?),
      );
      return val;
    });

Map<String, dynamic> _$SignedInResponseDtoToJson(
  SignedInResponseDto instance,
) => <String, dynamic>{
  'accessToken': instance.accessToken,
  'accessTokenExpiresInSeconds': instance.accessTokenExpiresInSeconds,
  'refreshToken': instance.refreshToken,
  'refreshTokenExpiresInSeconds': instance.refreshTokenExpiresInSeconds,
  'principal': instance.principal.toJson(),
  'profileComplete': instance.profileComplete,
};
