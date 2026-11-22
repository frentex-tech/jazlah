// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletResponseDto _$WalletResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('WalletResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['balanceHalalas']);
      final val = WalletResponseDto(
        balanceHalalas: $checkedConvert(
          'balanceHalalas',
          (v) => (v as num).toInt(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$WalletResponseDtoToJson(WalletResponseDto instance) =>
    <String, dynamic>{'balanceHalalas': instance.balanceHalalas};
