//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'wallet_transaction_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WalletTransactionResponseDto {
  /// Returns a new [WalletTransactionResponseDto] instance.
  WalletTransactionResponseDto({

    required  this.id,

    required  this.kind,

    required  this.amountHalalas,

    required  this.balanceAfterHalalas,

    required  this.orderId,

    required  this.note,

    required  this.createdAt,
  });

      /// The movement (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// Why it moved.
  @JsonKey(
    
    name: r'kind',
    required: true,
    includeIfNull: false,
  unknownEnumValue: WalletTransactionResponseDtoKindEnum.unknownDefaultOpenApi,
  )


  final WalletTransactionResponseDtoKindEnum kind;



      /// How much, in halalas: positive added, negative taken.
  @JsonKey(
    
    name: r'amountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int amountHalalas;



      /// The balance after it, in halalas.
  @JsonKey(
    
    name: r'balanceAfterHalalas',
    required: true,
    includeIfNull: false,
  )


  final int balanceAfterHalalas;



      /// The order it is about; null for an admin adjustment.
  @JsonKey(
    
    name: r'orderId',
    required: true,
    includeIfNull: true,
  )


  final String? orderId;



      /// The admin’s reason for an adjustment; null otherwise.
  @JsonKey(
    
    name: r'note',
    required: true,
    includeIfNull: true,
  )


  final String? note;



      /// When (UTC).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WalletTransactionResponseDto &&
      other.id == id &&
      other.kind == kind &&
      other.amountHalalas == amountHalalas &&
      other.balanceAfterHalalas == balanceAfterHalalas &&
      other.orderId == orderId &&
      other.note == note &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        kind.hashCode +
        amountHalalas.hashCode +
        balanceAfterHalalas.hashCode +
        (orderId == null ? 0 : orderId.hashCode) +
        (note == null ? 0 : note.hashCode) +
        createdAt.hashCode;

  factory WalletTransactionResponseDto.fromJson(Map<String, dynamic> json) => _$WalletTransactionResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$WalletTransactionResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Why it moved.
enum WalletTransactionResponseDtoKindEnum {
    /// Why it moved.
@JsonValue(r'admin_credit')
adminCredit(r'admin_credit'),
    /// Why it moved.
@JsonValue(r'admin_debit')
adminDebit(r'admin_debit'),
    /// Why it moved.
@JsonValue(r'order_payment')
orderPayment(r'order_payment'),
    /// Why it moved.
@JsonValue(r'payment_restored')
paymentRestored(r'payment_restored'),
    /// Why it moved.
@JsonValue(r'order_refund')
orderRefund(r'order_refund'),
    /// Why it moved.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const WalletTransactionResponseDtoKindEnum(this.value);

final String value;

@override
String toString() => value;
}


