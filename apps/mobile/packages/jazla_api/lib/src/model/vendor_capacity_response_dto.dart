//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/vendor_capacity_day_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_capacity_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorCapacityResponseDto {
  /// Returns a new [VendorCapacityResponseDto] instance.
  VendorCapacityResponseDto({

    required  this.vendorId,

    required  this.ordersPerDay,

    required  this.carcassesPerDay,

    required  this.days,
  });

      /// The vendor (UUID).
  @JsonKey(
    
    name: r'vendorId',
    required: true,
    includeIfNull: false,
  )


  final String vendorId;



      /// The vendor’s own daily order limit; null: the platform default (operations settings).
  @JsonKey(
    
    name: r'ordersPerDay',
    required: true,
    includeIfNull: true,
  )


  final int? ordersPerDay;



      /// The vendor’s own daily carcass limit; null: the platform default.
  @JsonKey(
    
    name: r'carcassesPerDay',
    required: true,
    includeIfNull: true,
  )


  final int? carcassesPerDay;



      /// Every day of the booking horizon from today, with its own limits and bookings.
  @JsonKey(
    
    name: r'days',
    required: true,
    includeIfNull: false,
  )


  final List<VendorCapacityDayResponseDto> days;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorCapacityResponseDto &&
      other.vendorId == vendorId &&
      other.ordersPerDay == ordersPerDay &&
      other.carcassesPerDay == carcassesPerDay &&
      other.days == days;

    @override
    int get hashCode =>
        vendorId.hashCode +
        (ordersPerDay == null ? 0 : ordersPerDay.hashCode) +
        (carcassesPerDay == null ? 0 : carcassesPerDay.hashCode) +
        days.hashCode;

  factory VendorCapacityResponseDto.fromJson(Map<String, dynamic> json) => _$VendorCapacityResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorCapacityResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

