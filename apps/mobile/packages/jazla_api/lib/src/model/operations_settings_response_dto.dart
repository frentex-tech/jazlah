//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/default_capacity_dto.dart';
import 'package:jazla_api/src/model/ordering_pause_response_dto.dart';
import 'package:jazla_api/src/model/cutoffs_dto.dart';
import 'package:jazla_api/src/model/cod_settings_dto.dart';
import 'package:jazla_api/src/model/closed_day_dto.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'operations_settings_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OperationsSettingsResponseDto {
  /// Returns a new [OperationsSettingsResponseDto] instance.
  OperationsSettingsResponseDto({

    required  this.deliveryWindow,

    required  this.cutoffs,

    required  this.defaultCapacity,

    required  this.cod,

    required  this.bookingHorizonDays,

    required  this.minOrderHalalas,

    required  this.deliveryFeeHalalas,

    required  this.complaintWindowHours,

    required  this.closedDays,

    required  this.paused,

    required  this.updatedAt,
  });

      /// The delivery window every delivery day uses, Riyadh time.
  @JsonKey(
    
    name: r'deliveryWindow',
    required: true,
    includeIfNull: false,
  )


  final TimeWindowDto deliveryWindow;



      /// The cut-off and lead days of each kind of order.
  @JsonKey(
    
    name: r'cutoffs',
    required: true,
    includeIfNull: false,
  )


  final CutoffsDto cutoffs;



      /// Each vendor’s daily capacity unless it has its own (PUT /v1/admin/vendors/{id}/capacity).
  @JsonKey(
    
    name: r'defaultCapacity',
    required: true,
    includeIfNull: false,
  )


  final DefaultCapacityDto defaultCapacity;



      /// Cash on delivery.
  @JsonKey(
    
    name: r'cod',
    required: true,
    includeIfNull: false,
  )


  final CodSettingsDto cod;



      /// How many days ahead can be booked, counting today: 14 offers today to today + 13. 1 to 60.
  @JsonKey(
    
    name: r'bookingHorizonDays',
    required: true,
    includeIfNull: false,
  )


  final int bookingHorizonDays;



      /// The smallest order, in halalas (VAT included), compared with the subtotal before any discount. 0 to 10000000.
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: true,
    includeIfNull: false,
  )


  final int minOrderHalalas;



      /// The delivery fee, in halalas (VAT included), added to delivery orders only and never discounted. 0 to 1000000.
  @JsonKey(
    
    name: r'deliveryFeeHalalas',
    required: true,
    includeIfNull: false,
  )


  final int deliveryFeeHalalas;



      /// How long after delivery a complaint can be opened (complaints: Sprint 5). 1 to 720.
  @JsonKey(
    
    name: r'complaintWindowHours',
    required: true,
    includeIfNull: false,
  )


  final int complaintWindowHours;



      /// The closed days, past ones included, in date order.
  @JsonKey(
    
    name: r'closedDays',
    required: true,
    includeIfNull: false,
  )


  final List<ClosedDayDto> closedDays;



      /// The pause; changed only with PUT /v1/admin/settings/operations/pause.
  @JsonKey(
    
    name: r'paused',
    required: true,
    includeIfNull: false,
  )


  final OrderingPauseResponseDto paused;



      /// When the settings last changed (UTC).
  @JsonKey(
    
    name: r'updatedAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime updatedAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OperationsSettingsResponseDto &&
      other.deliveryWindow == deliveryWindow &&
      other.cutoffs == cutoffs &&
      other.defaultCapacity == defaultCapacity &&
      other.cod == cod &&
      other.bookingHorizonDays == bookingHorizonDays &&
      other.minOrderHalalas == minOrderHalalas &&
      other.deliveryFeeHalalas == deliveryFeeHalalas &&
      other.complaintWindowHours == complaintWindowHours &&
      other.closedDays == closedDays &&
      other.paused == paused &&
      other.updatedAt == updatedAt;

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
        closedDays.hashCode +
        paused.hashCode +
        updatedAt.hashCode;

  factory OperationsSettingsResponseDto.fromJson(Map<String, dynamic> json) => _$OperationsSettingsResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OperationsSettingsResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

