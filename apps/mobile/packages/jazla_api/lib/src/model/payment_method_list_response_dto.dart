//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/payment_method_option_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'payment_method_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PaymentMethodListResponseDto {
  /// Returns a new [PaymentMethodListResponseDto] instance.
  PaymentMethodListResponseDto({

    required  this.items,

    required  this.walletBalanceHalalas,

    required  this.totalHalalas,
  });

      /// The methods, in display order. Cash on delivery is left out when it is off, over its limit or not allowed for the order type.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<PaymentMethodOptionResponseDto> items;



      /// The customer’s wallet balance, in halalas; any part of it can pay with another method.
  @JsonKey(
    
    name: r'walletBalanceHalalas',
    required: true,
    includeIfNull: false,
  )


  final int walletBalanceHalalas;



      /// The total these methods are for, in halalas.
  @JsonKey(
    
    name: r'totalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int totalHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PaymentMethodListResponseDto &&
      other.items == items &&
      other.walletBalanceHalalas == walletBalanceHalalas &&
      other.totalHalalas == totalHalalas;

    @override
    int get hashCode =>
        items.hashCode +
        walletBalanceHalalas.hashCode +
        totalHalalas.hashCode;

  factory PaymentMethodListResponseDto.fromJson(Map<String, dynamic> json) => _$PaymentMethodListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentMethodListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

