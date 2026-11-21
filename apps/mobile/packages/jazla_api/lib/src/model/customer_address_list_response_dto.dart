//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/customer_address_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'customer_address_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CustomerAddressListResponseDto {
  /// Returns a new [CustomerAddressListResponseDto] instance.
  CustomerAddressListResponseDto({

    required  this.items,
  });

      /// Every saved address of the customer: the default first, then newest first. At most 10; empty when none is saved.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<CustomerAddressResponseDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CustomerAddressListResponseDto &&
      other.items == items;

    @override
    int get hashCode =>
        items.hashCode;

  factory CustomerAddressListResponseDto.fromJson(Map<String, dynamic> json) => _$CustomerAddressListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerAddressListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

