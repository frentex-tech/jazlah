//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'order_refund_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderRefundResponseDto {
  /// Returns a new [OrderRefundResponseDto] instance.
  OrderRefundResponseDto({

    required  this.id,

    required  this.amountHalalas,

    required  this.destination,

    required  this.status,

    required  this.reason,

    required  this.createdAt,
  });

      /// The refund (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// How much, in halalas.
  @JsonKey(
    
    name: r'amountHalalas',
    required: true,
    includeIfNull: false,
  )


  final int amountHalalas;



      /// Where it goes.
  @JsonKey(
    
    name: r'destination',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderRefundResponseDtoDestinationEnum.unknownDefaultOpenApi,
  )


  final OrderRefundResponseDtoDestinationEnum destination;



      /// Where it is.
  @JsonKey(
    
    name: r'status',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderRefundResponseDtoStatusEnum.unknownDefaultOpenApi,
  )


  final OrderRefundResponseDtoStatusEnum status;



      /// Why, as written by staff.
  @JsonKey(
    
    name: r'reason',
    required: true,
    includeIfNull: false,
  )


  final String reason;



      /// When it was made (UTC).
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderRefundResponseDto &&
      other.id == id &&
      other.amountHalalas == amountHalalas &&
      other.destination == destination &&
      other.status == status &&
      other.reason == reason &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        amountHalalas.hashCode +
        destination.hashCode +
        status.hashCode +
        reason.hashCode +
        createdAt.hashCode;

  factory OrderRefundResponseDto.fromJson(Map<String, dynamic> json) => _$OrderRefundResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderRefundResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Where it goes.
enum OrderRefundResponseDtoDestinationEnum {
    /// Where it goes.
@JsonValue(r'wallet')
wallet(r'wallet'),
    /// Where it goes.
@JsonValue(r'original')
original(r'original'),
    /// Where it goes.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const OrderRefundResponseDtoDestinationEnum(this.value);

final String value;

@override
String toString() => value;
}


/// Where it is.
enum OrderRefundResponseDtoStatusEnum {
    /// Where it is.
@JsonValue(r'pending')
pending(r'pending'),
    /// Where it is.
@JsonValue(r'succeeded')
succeeded(r'succeeded'),
    /// Where it is.
@JsonValue(r'failed')
failed(r'failed'),
    /// Where it is.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const OrderRefundResponseDtoStatusEnum(this.value);

final String value;

@override
String toString() => value;
}


