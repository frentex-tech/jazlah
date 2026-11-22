// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_transaction_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletTransactionPageResponseDto _$WalletTransactionPageResponseDtoFromJson(
  Map<String, dynamic> json,
) =>
    $checkedCreate('WalletTransactionPageResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
      final val = WalletTransactionPageResponseDto(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map(
                (e) => WalletTransactionResponseDto.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
        nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$WalletTransactionPageResponseDtoToJson(
  WalletTransactionPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
