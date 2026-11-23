//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'order_customer_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderCustomerResponseDto {
  /// Returns a new [OrderCustomerResponseDto] instance.
  OrderCustomerResponseDto({

    required  this.id,

    required  this.name,

    required  this.phone,
  });

      /// The customer (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The profile’s full name; null when not set.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: true,
  )


  final String? name;



      /// The customer’s mobile: in full for admins, masked for the vendor (`+966*******01`, as maskPhoneNumber).
  @JsonKey(
    
    name: r'phone',
    required: true,
    includeIfNull: false,
  )


  final String phone;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderCustomerResponseDto &&
      other.id == id &&
      other.name == name &&
      other.phone == phone;

    @override
    int get hashCode =>
        id.hashCode +
        (name == null ? 0 : name.hashCode) +
        phone.hashCode;

  factory OrderCustomerResponseDto.fromJson(Map<String, dynamic> json) => _$OrderCustomerResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderCustomerResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

