//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/payment_status.dart';
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_payment_summary_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderPaymentSummaryResponseDto {
  /// Returns a new [OrderPaymentSummaryResponseDto] instance.
  OrderPaymentSummaryResponseDto({

    required  this.method,

    required  this.status,

    required  this.paymentId,

    required  this.walletHalalas,

    required  this.walletRestoredHalalas,

    required  this.cardLast4,
  });

      /// The method chosen for what the wallet does not cover.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentMethod.unknownDefaultOpenApi,
  )


  final PaymentMethod method;



      /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: true,
  unknownEnumValue: PaymentStatus.unknownDefaultOpenApi,
  )


  final PaymentStatus? status;



      /// The latest payment (UUID); null as status is.
  @JsonKey(
    
    name: r'paymentId',
    required: true,
    includeIfNull: true,
  )


  final String? paymentId;



      /// The part paid from the wallet, in halalas; 0 for none.
  @JsonKey(
    
    name: r'walletHalalas',
    required: true,
    includeIfNull: false,
  )


  final int walletHalalas;



      /// Wallet money given back because the online part failed or the order was cancelled unpaid; 0 for none.
  @JsonKey(
    
    name: r'walletRestoredHalalas',
    required: true,
    includeIfNull: false,
  )


  final int walletRestoredHalalas;



      /// The card’s last 4 digits once known; null otherwise.
  @JsonKey(
    
    name: r'cardLast4',
    required: true,
    includeIfNull: true,
  )


  final String? cardLast4;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderPaymentSummaryResponseDto &&
      other.method == method &&
      other.status == status &&
      other.paymentId == paymentId &&
      other.walletHalalas == walletHalalas &&
      other.walletRestoredHalalas == walletRestoredHalalas &&
      other.cardLast4 == cardLast4;

    @override
    int get hashCode =>
        method.hashCode +
        (status == null ? 0 : status.hashCode) +
        (paymentId == null ? 0 : paymentId.hashCode) +
        walletHalalas.hashCode +
        walletRestoredHalalas.hashCode +
        (cardLast4 == null ? 0 : cardLast4.hashCode);

  factory OrderPaymentSummaryResponseDto.fromJson(Map<String, dynamic> json) => _$OrderPaymentSummaryResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderPaymentSummaryResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

