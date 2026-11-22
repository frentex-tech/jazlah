//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'vendor_capacity_day_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorCapacityDayResponseDto {
  /// Returns a new [VendorCapacityDayResponseDto] instance.
  VendorCapacityDayResponseDto({

    required  this.date,

    required  this.ordersLimit,

    required  this.carcassesLimit,

    required  this.ordersBooked,

    required  this.carcassesBooked,
  });

      /// The day, Riyadh calendar `yyyy-MM-dd`.
  @JsonKey(
    
    name: r'date',
    required: true,
    includeIfNull: false,
  )


  final String date;



      /// This day’s own order limit; null: the vendor’s (or the platform’s) daily limit.
  @JsonKey(
    
    name: r'ordersLimit',
    required: true,
    includeIfNull: true,
  )


  final int? ordersLimit;



      /// This day’s own carcass limit; null: the daily limit.
  @JsonKey(
    
    name: r'carcassesLimit',
    required: true,
    includeIfNull: true,
  )


  final int? carcassesLimit;



      /// Orders already booked for the day.
  @JsonKey(
    
    name: r'ordersBooked',
    required: true,
    includeIfNull: false,
  )


  final int ordersBooked;



      /// Carcasses already booked for the day.
  @JsonKey(
    
    name: r'carcassesBooked',
    required: true,
    includeIfNull: false,
  )


  final int carcassesBooked;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorCapacityDayResponseDto &&
      other.date == date &&
      other.ordersLimit == ordersLimit &&
      other.carcassesLimit == carcassesLimit &&
      other.ordersBooked == ordersBooked &&
      other.carcassesBooked == carcassesBooked;

    @override
    int get hashCode =>
        date.hashCode +
        (ordersLimit == null ? 0 : ordersLimit.hashCode) +
        (carcassesLimit == null ? 0 : carcassesLimit.hashCode) +
        ordersBooked.hashCode +
        carcassesBooked.hashCode;

  factory VendorCapacityDayResponseDto.fromJson(Map<String, dynamic> json) => _$VendorCapacityDayResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorCapacityDayResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

