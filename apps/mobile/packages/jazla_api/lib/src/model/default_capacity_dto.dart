//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'default_capacity_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class DefaultCapacityDto {
  /// Returns a new [DefaultCapacityDto] instance.
  DefaultCapacityDto({

    required  this.ordersPerDay,

    required  this.carcassesPerDay,
  });

      /// Orders per day, 1 to 100000.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'ordersPerDay',
    required: true,
    includeIfNull: false,
  )


  final int ordersPerDay;



      /// Whole carcasses per day, 1 to 100000.
          // minimum: 1
          // maximum: 100000
  @JsonKey(
    
    name: r'carcassesPerDay',
    required: true,
    includeIfNull: false,
  )


  final int carcassesPerDay;





    @override
    bool operator ==(Object other) => identical(this, other) || other is DefaultCapacityDto &&
      other.ordersPerDay == ordersPerDay &&
      other.carcassesPerDay == carcassesPerDay;

    @override
    int get hashCode =>
        ordersPerDay.hashCode +
        carcassesPerDay.hashCode;

  factory DefaultCapacityDto.fromJson(Map<String, dynamic> json) => _$DefaultCapacityDtoFromJson(json);

  Map<String, dynamic> toJson() => _$DefaultCapacityDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

