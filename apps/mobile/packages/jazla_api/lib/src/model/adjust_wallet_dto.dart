//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'adjust_wallet_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AdjustWalletDto {
  /// Returns a new [AdjustWalletDto] instance.
  AdjustWalletDto({

    required  this.type,

    required  this.amountHalalas,

    required  this.reason,
  });

      /// `credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).
  @JsonKey(
    
    name: r'type',
    required: true,
    includeIfNull: false,
  unknownEnumValue: AdjustWalletDtoTypeEnum.unknownDefaultOpenApi,
  )


  final AdjustWalletDtoTypeEnum type;



      /// How much, in halalas, 1 to 10000000.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'amountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int amountHalalas;



      /// Why, kept in the audit log and shown in the history; 3 to 500 characters.
  @JsonKey(
    
    name: r'reason',
    required: true,
    includeIfNull: false,
  )


  final String reason;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AdjustWalletDto &&
      other.type == type &&
      other.amountHalalas == amountHalalas &&
      other.reason == reason;

    @override
    int get hashCode =>
        type.hashCode +
        amountHalalas.hashCode +
        reason.hashCode;

  factory AdjustWalletDto.fromJson(Map<String, dynamic> json) => _$AdjustWalletDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AdjustWalletDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).
enum AdjustWalletDtoTypeEnum {
    /// `credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).
@JsonValue(r'credit')
credit(r'credit'),
    /// `credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).
@JsonValue(r'debit')
debit(r'debit'),
    /// `credit` adds, `debit` takes (WALLET_INSUFFICIENT beyond the balance).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const AdjustWalletDtoTypeEnum(this.value);

final String value;

@override
String toString() => value;
}


