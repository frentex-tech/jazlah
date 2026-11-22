//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/default_capacity_dto.dart';
import 'package:jazla_api/src/model/cutoffs_dto.dart';
import 'package:jazla_api/src/model/cod_settings_dto.dart';
import 'package:jazla_api/src/model/closed_day_dto.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'update_operations_settings_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UpdateOperationsSettingsDto {
  /// Returns a new [UpdateOperationsSettingsDto] instance.
  UpdateOperationsSettingsDto({

     this.deliveryWindow,

     this.cutoffs,

     this.defaultCapacity,

     this.cod,

     this.bookingHorizonDays,

     this.minOrderHalalas,

     this.deliveryFeeHalalas,

     this.complaintWindowHours,

     this.closedDays,
  });

      /// The delivery window every delivery day uses, Riyadh time. Left out: unchanged.
  @JsonKey(
    
    name: r'deliveryWindow',
    required: false,
    includeIfNull: false,
  )


  final TimeWindowDto? deliveryWindow;



      /// The cut-off and lead days of each kind of order. Left out: unchanged.
  @JsonKey(
    
    name: r'cutoffs',
    required: false,
    includeIfNull: false,
  )


  final CutoffsDto? cutoffs;



      /// Each vendor’s daily capacity unless it has its own (PUT /v1/admin/vendors/{id}/capacity). Left out: unchanged.
  @JsonKey(
    
    name: r'defaultCapacity',
    required: false,
    includeIfNull: false,
  )


  final DefaultCapacityDto? defaultCapacity;



      /// Cash on delivery. Left out: unchanged.
  @JsonKey(
    
    name: r'cod',
    required: false,
    includeIfNull: false,
  )


  final CodSettingsDto? cod;



      /// How many days ahead can be booked, counting today: 14 offers today to today + 13. 1 to 60. Left out: unchanged.
          // minimum: 1
          // maximum: 60
  @JsonKey(
    
    name: r'bookingHorizonDays',
    required: false,
    includeIfNull: false,
  )


  final int? bookingHorizonDays;



      /// The smallest order, in halalas (VAT included), compared with the subtotal before any discount. 0 to 10000000. Left out: unchanged.
          // minimum: 0
          // maximum: 10000000
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? minOrderHalalas;



      /// The delivery fee, in halalas (VAT included), added to delivery orders only and never discounted. 0 to 1000000. Left out: unchanged.
          // minimum: 0
          // maximum: 1000000
  @JsonKey(
    
    name: r'deliveryFeeHalalas',
    required: false,
    includeIfNull: false,
  )


  final int? deliveryFeeHalalas;



      /// How long after delivery a complaint can be opened (complaints: Sprint 5). 1 to 720. Left out: unchanged.
          // minimum: 1
          // maximum: 720
  @JsonKey(
    
    name: r'complaintWindowHours',
    required: false,
    includeIfNull: false,
  )


  final int? complaintWindowHours;



      /// The whole list of closed days, at most 366, each date once; replaces the saved list. Left out: unchanged.
  @JsonKey(
    
    name: r'closedDays',
    required: false,
    includeIfNull: false,
  )


  final List<ClosedDayDto>? closedDays;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UpdateOperationsSettingsDto &&
      other.deliveryWindow == deliveryWindow &&
      other.cutoffs == cutoffs &&
      other.defaultCapacity == defaultCapacity &&
      other.cod == cod &&
      other.bookingHorizonDays == bookingHorizonDays &&
      other.minOrderHalalas == minOrderHalalas &&
      other.deliveryFeeHalalas == deliveryFeeHalalas &&
      other.complaintWindowHours == complaintWindowHours &&
      other.closedDays == closedDays;

    @override
    int get hashCode =>
        deliveryWindow.hashCode +
        cutoffs.hashCode +
        defaultCapacity.hashCode +
        cod.hashCode +
        bookingHorizonDays.hashCode +
        minOrderHalalas.hashCode +
        deliveryFeeHalalas.hashCode +
        complaintWindowHours.hashCode +
        closedDays.hashCode;

  factory UpdateOperationsSettingsDto.fromJson(Map<String, dynamic> json) => _$UpdateOperationsSettingsDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UpdateOperationsSettingsDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

