// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refresh_token_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RefreshTokenDto _$RefreshTokenDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('RefreshTokenDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['refreshToken']);
      final val = RefreshTokenDto(
        refreshToken: $checkedConvert('refreshToken', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$RefreshTokenDtoToJson(RefreshTokenDto instance) =>
    <String, dynamic>{'refreshToken': instance.refreshToken};
