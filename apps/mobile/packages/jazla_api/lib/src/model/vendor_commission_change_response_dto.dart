//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'vendor_commission_change_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorCommissionChangeResponseDto {
  /// Returns a new [VendorCommissionChangeResponseDto] instance.
  VendorCommissionChangeResponseDto({

    required  this.id,

    required  this.commissionBasisPoints,

    required  this.previousCommissionBasisPoints,

    required  this.changedById,

    required  this.createdAt,
  });

      /// The history entry id, a UUID.
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The commission set, in basis points (0 to 10000): 1250 is 12.5%.
  @JsonKey(
    
    name: r'commissionBasisPoints',
    required: true,
    includeIfNull: false,
  )


  final num commissionBasisPoints;



      /// The commission before this change, in basis points; null for the vendor’s first commission (set at approval).
  @JsonKey(
    
    name: r'previousCommissionBasisPoints',
    required: true,
    includeIfNull: true,
  )


  final num? previousCommissionBasisPoints;



      /// The admin (user UUID) who set it; null when the system did (the platform vendor’s creation).
  @JsonKey(
    
    name: r'changedById',
    required: true,
    includeIfNull: true,
  )


  final String? changedById;



      /// When the change was made, UTC ISO 8601.
  @JsonKey(
    
    name: r'createdAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime createdAt;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorCommissionChangeResponseDto &&
      other.id == id &&
      other.commissionBasisPoints == commissionBasisPoints &&
      other.previousCommissionBasisPoints == previousCommissionBasisPoints &&
      other.changedById == changedById &&
      other.createdAt == createdAt;

    @override
    int get hashCode =>
        id.hashCode +
        commissionBasisPoints.hashCode +
        (previousCommissionBasisPoints == null ? 0 : previousCommissionBasisPoints.hashCode) +
        (changedById == null ? 0 : changedById.hashCode) +
        createdAt.hashCode;

  factory VendorCommissionChangeResponseDto.fromJson(Map<String, dynamic> json) => _$VendorCommissionChangeResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorCommissionChangeResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

