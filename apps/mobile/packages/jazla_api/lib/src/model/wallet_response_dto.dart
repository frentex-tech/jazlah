//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'wallet_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class WalletResponseDto {
  /// Returns a new [WalletResponseDto] instance.
  WalletResponseDto({

    required  this.balanceHalalas,
  });

      /// The balance, in halalas; never below 0. The wallet part of an unpaid order past its `expiresAt` is already back in it.
  @JsonKey(
    
    name: r'balanceHalalas',
    required: true,
    includeIfNull: false,
  )


  final int balanceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is WalletResponseDto &&
      other.balanceHalalas == balanceHalalas;

    @override
    int get hashCode =>
        balanceHalalas.hashCode;

  factory WalletResponseDto.fromJson(Map<String, dynamic> json) => _$WalletResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$WalletResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

