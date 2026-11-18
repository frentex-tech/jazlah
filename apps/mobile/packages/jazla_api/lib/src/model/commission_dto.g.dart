// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'commission_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CommissionDto _$CommissionDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CommissionDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['commissionBasisPoints']);
      final val = CommissionDto(
        commissionBasisPoints: $checkedConvert(
          'commissionBasisPoints',
          (v) => v as num,
        ),
      );
      return val;
    });

Map<String, dynamic> _$CommissionDtoToJson(CommissionDto instance) =>
    <String, dynamic>{'commissionBasisPoints': instance.commissionBasisPoints};
