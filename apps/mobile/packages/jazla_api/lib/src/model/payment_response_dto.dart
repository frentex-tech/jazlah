//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/payment_status.dart';
import 'package:jazla_api/src/model/payment_next_action_response_dto.dart';
import 'package:jazla_api/src/model/payment_method.dart';
import 'package:json_annotation/json_annotation.dart';

part 'payment_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PaymentResponseDto {
  /// Returns a new [PaymentResponseDto] instance.
  PaymentResponseDto({

    required  this.id,

    required  this.method,

    required  this.status,

    required  this.amountHalalas,

    required  this.nextAction,

    required  this.createdAt,
  });

      /// The payment (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// How it is paid.
  @JsonKey(
    
    name: r'method',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentMethod.unknownDefaultOpenApi,
  )


  final PaymentMethod method;



      /// Where it is.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: PaymentStatus.unknownDefaultOpenApi,
  )


  final PaymentStatus status;



      /// How much this attempt charges, in halalas (the order total less the wallet part).
  @JsonKey(
    
    name: r'amountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int amountHalalas;



      /// What the app does next; null when nothing is paid online (cash on delivery, wallet only) or the payment is no longer `initiated`.
  @JsonKey(
    
    name: r'nextAction',
    required: true,
    includeIfNull: true,
  )


  final PaymentNextActionResponseDto? nextAction;



      /// When it was started (UTC).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PaymentResponseDto &&
      other.id == id &&
      other.method == method &&
      other.status == status &&
      other.amountHalalas == amountHalalas &&
      other.nextAction == nextAction &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        method.hashCode +
        status.hashCode +
        amountHalalas.hashCode +
        (nextAction == null ? 0 : nextAction.hashCode) +
        createdAt.hashCode;

  factory PaymentResponseDto.fromJson(Map<String, dynamic> json) => _$PaymentResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

