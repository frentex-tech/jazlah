// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_commission_change_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorCommissionChangeResponseDto _$VendorCommissionChangeResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorCommissionChangeResponseDto', json, (
  $checkedConvert,
) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'commissionBasisPoints',
      'previousCommissionBasisPoints',
      'changedById',
      'createdAt',
    ],
  );
  final val = VendorCommissionChangeResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    commissionBasisPoints: $checkedConvert(
      'commissionBasisPoints',
      (v) => v as num,
    ),
    previousCommissionBasisPoints: $checkedConvert(
      'previousCommissionBasisPoints',
      (v) => v as num?,
    ),
    changedById: $checkedConvert('changedById', (v) => v as String?),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$VendorCommissionChangeResponseDtoToJson(
  VendorCommissionChangeResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'commissionBasisPoints': instance.commissionBasisPoints,
  'previousCommissionBasisPoints': instance.previousCommissionBasisPoints,
  'changedById': instance.changedById,
  'createdAt': instance.createdAt.toIso8601String(),
};
