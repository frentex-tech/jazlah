//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_vendor_capacity_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetVendorCapacityDto {
  /// Returns a new [SetVendorCapacityDto] instance.
  SetVendorCapacityDto({

    required  this.ordersPerDay,

    required  this.carcassesPerDay,
  });

      /// Orders per day, 1 to 100000; null: use the platform default.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'ordersPerDay',
    required: true,
    includeIfNull: true,
  )


  final int? ordersPerDay;



      /// Carcasses per day, 1 to 100000; null: use the platform default.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'carcassesPerDay',
    required: true,
    includeIfNull: true,
  )


  final int? carcassesPerDay;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetVendorCapacityDto &&
      other.ordersPerDay == ordersPerDay &&
      other.carcassesPerDay == carcassesPerDay;

    @override
    int get hashCode =>
        (ordersPerDay == null ? 0 : ordersPerDay.hashCode) +
        (carcassesPerDay == null ? 0 : carcassesPerDay.hashCode);

  factory SetVendorCapacityDto.fromJson(Map<String, dynamic> json) => _$SetVendorCapacityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetVendorCapacityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

