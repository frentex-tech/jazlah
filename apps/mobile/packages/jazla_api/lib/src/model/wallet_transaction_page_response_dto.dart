//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/wallet_transaction_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'wallet_transaction_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WalletTransactionPageResponseDto {
  /// Returns a new [WalletTransactionPageResponseDto] instance.
  WalletTransactionPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The movements on this page.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<WalletTransactionResponseDto> items;



      /// Send as `cursor` for the next page; null on the last.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WalletTransactionPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory WalletTransactionPageResponseDto.fromJson(Map<String, dynamic> json) => _$WalletTransactionPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$WalletTransactionPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

