//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_vendor_day_capacity_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetVendorDayCapacityDto {
  /// Returns a new [SetVendorDayCapacityDto] instance.
  SetVendorDayCapacityDto({

    required  this.ordersLimit,

    required  this.carcassesLimit,
  });

      /// Orders that day, 1 to 100000; null: the daily limit.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'ordersLimit',
    required: true,
    includeIfNull: true,
  )


  final int? ordersLimit;



      /// Carcasses that day, 1 to 100000; null: the daily limit.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'carcassesLimit',
    required: true,
    includeIfNull: true,
  )


  final int? carcassesLimit;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetVendorDayCapacityDto &&
      other.ordersLimit == ordersLimit &&
      other.carcassesLimit == carcassesLimit;

    @override
    int get hashCode =>
        (ordersLimit == null ? 0 : ordersLimit.hashCode) +
        (carcassesLimit == null ? 0 : carcassesLimit.hashCode);

  factory SetVendorDayCapacityDto.fromJson(Map<String, dynamic> json) => _$SetVendorDayCapacityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetVendorDayCapacityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

