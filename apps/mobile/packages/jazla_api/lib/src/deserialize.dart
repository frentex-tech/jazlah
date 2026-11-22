import 'package:jazla_api/src/model/admin_vendor_page_response_dto.dart';
import 'package:jazla_api/src/model/admin_vendor_response_dto.dart';
import 'package:jazla_api/src/model/auth_tokens_response_dto.dart';
import 'package:jazla_api/src/model/change_product_prices_dto.dart';
import 'package:jazla_api/src/model/commission_dto.dart';
import 'package:jazla_api/src/model/coverage_check_response_dto.dart';
import 'package:jazla_api/src/model/coverage_zone_page_response_dto.dart';
import 'package:jazla_api/src/model/coverage_zone_response_dto.dart';
import 'package:jazla_api/src/model/covering_zone_response_dto.dart';
import 'package:jazla_api/src/model/create_coverage_zone_dto.dart';
import 'package:jazla_api/src/model/create_customer_address_dto.dart';
import 'package:jazla_api/src/model/create_cutting_packaging_incompatibility_dto.dart';
import 'package:jazla_api/src/model/create_product_dto.dart';
import 'package:jazla_api/src/model/create_reference_item_dto.dart';
import 'package:jazla_api/src/model/customer_address_list_response_dto.dart';
import 'package:jazla_api/src/model/customer_address_response_dto.dart';
import 'package:jazla_api/src/model/customer_me_response_dto.dart';
import 'package:jazla_api/src/model/customer_profile_response_dto.dart';
import 'package:jazla_api/src/model/cutting_packaging_incompatibility_page_response_dto.dart';
import 'package:jazla_api/src/model/cutting_packaging_incompatibility_response_dto.dart';
import 'package:jazla_api/src/model/cutting_price_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto_details.dart';
import 'package:jazla_api/src/model/field_error_dto.dart';
import 'package:jazla_api/src/model/geo_json_polygon_dto.dart';
import 'package:jazla_api/src/model/geo_point_dto.dart';
import 'package:jazla_api/src/model/incompatible_pair_response_dto.dart';
import 'package:jazla_api/src/model/liveness_response_dto.dart';
import 'package:jazla_api/src/model/localized_description_dto.dart';
import 'package:jazla_api/src/model/localized_name_dto.dart';
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/marketing_consent_response_dto.dart';
import 'package:jazla_api/src/model/media_file_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_list_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:jazla_api/src/model/optional_localized_text_response_dto.dart';
import 'package:jazla_api/src/model/otp_requested_response_dto.dart';
import 'package:jazla_api/src/model/packaging_price_dto.dart';
import 'package:jazla_api/src/model/principal_response_dto.dart';
import 'package:jazla_api/src/model/product_card_page_response_dto.dart';
import 'package:jazla_api/src/model/product_card_response_dto.dart';
import 'package:jazla_api/src/model/product_change_request_page_response_dto.dart';
import 'package:jazla_api/src/model/product_change_request_response_dto.dart';
import 'package:jazla_api/src/model/product_content_dto.dart';
import 'package:jazla_api/src/model/product_content_response_dto.dart';
import 'package:jazla_api/src/model/product_cutting_dto.dart';
import 'package:jazla_api/src/model/product_cutting_response_dto.dart';
import 'package:jazla_api/src/model/product_image_response_dto.dart';
import 'package:jazla_api/src/model/product_packaging_dto.dart';
import 'package:jazla_api/src/model/product_packaging_response_dto.dart';
import 'package:jazla_api/src/model/product_response_dto.dart';
import 'package:jazla_api/src/model/product_size_dto.dart';
import 'package:jazla_api/src/model/product_size_response_dto.dart';
import 'package:jazla_api/src/model/product_vendor_response_dto.dart';
import 'package:jazla_api/src/model/public_category_list_response_dto.dart';
import 'package:jazla_api/src/model/public_product_cutting_response_dto.dart';
import 'package:jazla_api/src/model/public_product_response_dto.dart';
import 'package:jazla_api/src/model/public_product_size_response_dto.dart';
import 'package:jazla_api/src/model/public_vendor_page_response_dto.dart';
import 'package:jazla_api/src/model/public_vendor_response_dto.dart';
import 'package:jazla_api/src/model/readiness_checks_dto.dart';
import 'package:jazla_api/src/model/readiness_response_dto.dart';
import 'package:jazla_api/src/model/reason_dto.dart';
import 'package:jazla_api/src/model/reference_item_page_response_dto.dart';
import 'package:jazla_api/src/model/reference_item_response_dto.dart';
import 'package:jazla_api/src/model/refresh_token_dto.dart';
import 'package:jazla_api/src/model/request_admin_upload_dto.dart';
import 'package:jazla_api/src/model/request_customer_upload_dto.dart';
import 'package:jazla_api/src/model/request_otp_dto.dart';
import 'package:jazla_api/src/model/request_vendor_upload_dto.dart';
import 'package:jazla_api/src/model/review_queue_item_response_dto.dart';
import 'package:jazla_api/src/model/review_queue_page_response_dto.dart';
import 'package:jazla_api/src/model/set_marketing_consent_dto.dart';
import 'package:jazla_api/src/model/set_product_availability_dto.dart';
import 'package:jazla_api/src/model/set_product_fulfilment_dto.dart';
import 'package:jazla_api/src/model/signed_in_response_dto.dart';
import 'package:jazla_api/src/model/size_availability_dto.dart';
import 'package:jazla_api/src/model/size_price_dto.dart';
import 'package:jazla_api/src/model/submit_vendor_application_dto.dart';
import 'package:jazla_api/src/model/update_coverage_zone_dto.dart';
import 'package:jazla_api/src/model/update_customer_address_dto.dart';
import 'package:jazla_api/src/model/update_customer_profile_dto.dart';
import 'package:jazla_api/src/model/update_reference_item_dto.dart';
import 'package:jazla_api/src/model/update_vendor_profile_as_admin_dto.dart';
import 'package:jazla_api/src/model/update_vendor_profile_dto.dart';
import 'package:jazla_api/src/model/upload_ticket_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_detail_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_document_dto.dart';
import 'package:jazla_api/src/model/vendor_application_document_link_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_document_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_page_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_response_dto.dart';
import 'package:jazla_api/src/model/vendor_commission_change_page_response_dto.dart';
import 'package:jazla_api/src/model/vendor_commission_change_response_dto.dart';
import 'package:jazla_api/src/model/vendor_incompatibility_list_response_dto.dart';
import 'package:jazla_api/src/model/vendor_incompatibility_response_dto.dart';
import 'package:jazla_api/src/model/vendor_profile_response_dto.dart';
import 'package:jazla_api/src/model/verify_otp_dto.dart';

final _regList = RegExp(r'^List<(.*)>$');
final _regSet = RegExp(r'^Set<(.*)>$');
final _regMap = RegExp(r'^Map<String,(.*)>$');

  ReturnType deserialize<ReturnType, BaseType>(dynamic value, String targetType, {bool growable= true}) {
      switch (targetType) {
        case 'String':
          return '$value' as ReturnType;
        case 'int':
          return (value is int ? value : int.parse('$value')) as ReturnType;
        case 'bool':
          if (value is bool) {
            return value as ReturnType;
          }
          final valueString = '$value'.toLowerCase();
          return (valueString == 'true' || valueString == '1') as ReturnType;
        case 'double':
          return (value is double ? value : double.parse('$value')) as ReturnType;
        case 'AdminVendorPageResponseDto':
          return AdminVendorPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'AdminVendorResponseDto':
          return AdminVendorResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'AuthTokensResponseDto':
          return AuthTokensResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ChangeProductPricesDto':
          return ChangeProductPricesDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CommissionDto':
          return CommissionDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CoverageCheckResponseDto':
          return CoverageCheckResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CoverageZonePageResponseDto':
          return CoverageZonePageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CoverageZoneResponseDto':
          return CoverageZoneResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CoveringZoneResponseDto':
          return CoveringZoneResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateCoverageZoneDto':
          return CreateCoverageZoneDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateCustomerAddressDto':
          return CreateCustomerAddressDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateCuttingPackagingIncompatibilityDto':
          return CreateCuttingPackagingIncompatibilityDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateProductDto':
          return CreateProductDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CreateReferenceItemDto':
          return CreateReferenceItemDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerAddressListResponseDto':
          return CustomerAddressListResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerAddressResponseDto':
          return CustomerAddressResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerMeResponseDto':
          return CustomerMeResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CustomerProfileResponseDto':
          return CustomerProfileResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CuttingPackagingIncompatibilityPageResponseDto':
          return CuttingPackagingIncompatibilityPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CuttingPackagingIncompatibilityResponseDto':
          return CuttingPackagingIncompatibilityResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'CuttingPriceDto':
          return CuttingPriceDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ErrorCode':
          
          
        case 'ErrorResponseDto':
          return ErrorResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ErrorResponseDtoDetails':
          return ErrorResponseDtoDetails.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'FieldErrorDto':
          return FieldErrorDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'GeoJsonPolygonDto':
          return GeoJsonPolygonDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'GeoPointDto':
          return GeoPointDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'IncompatiblePairResponseDto':
          return IncompatiblePairResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'LivenessResponseDto':
          return LivenessResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'LocalizedDescriptionDto':
          return LocalizedDescriptionDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'LocalizedNameDto':
          return LocalizedNameDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'LocalizedTextResponseDto':
          return LocalizedTextResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'MarketingConsentResponseDto':
          return MarketingConsentResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'MediaFileResponseDto':
          return MediaFileResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'NamedReferenceListResponseDto':
          return NamedReferenceListResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'NamedReferenceResponseDto':
          return NamedReferenceResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'OptionalLocalizedTextResponseDto':
          return OptionalLocalizedTextResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'OtpRequestedResponseDto':
          return OtpRequestedResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PackagingPriceDto':
          return PackagingPriceDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PrincipalResponseDto':
          return PrincipalResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductCardPageResponseDto':
          return ProductCardPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductCardResponseDto':
          return ProductCardResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductChangeRequestPageResponseDto':
          return ProductChangeRequestPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductChangeRequestResponseDto':
          return ProductChangeRequestResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductContentDto':
          return ProductContentDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductContentResponseDto':
          return ProductContentResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductCuttingDto':
          return ProductCuttingDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductCuttingResponseDto':
          return ProductCuttingResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductImageResponseDto':
          return ProductImageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductPackagingDto':
          return ProductPackagingDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductPackagingResponseDto':
          return ProductPackagingResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductResponseDto':
          return ProductResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductSizeDto':
          return ProductSizeDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductSizeResponseDto':
          return ProductSizeResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ProductVendorResponseDto':
          return ProductVendorResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicCategoryListResponseDto':
          return PublicCategoryListResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicProductCuttingResponseDto':
          return PublicProductCuttingResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicProductResponseDto':
          return PublicProductResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicProductSizeResponseDto':
          return PublicProductSizeResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicVendorPageResponseDto':
          return PublicVendorPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'PublicVendorResponseDto':
          return PublicVendorResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReadinessChecksDto':
          return ReadinessChecksDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReadinessResponseDto':
          return ReadinessResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReasonDto':
          return ReasonDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReferenceItemPageResponseDto':
          return ReferenceItemPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReferenceItemResponseDto':
          return ReferenceItemResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RefreshTokenDto':
          return RefreshTokenDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RequestAdminUploadDto':
          return RequestAdminUploadDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RequestCustomerUploadDto':
          return RequestCustomerUploadDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RequestOtpDto':
          return RequestOtpDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'RequestVendorUploadDto':
          return RequestVendorUploadDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReviewQueueItemResponseDto':
          return ReviewQueueItemResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'ReviewQueuePageResponseDto':
          return ReviewQueuePageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SetMarketingConsentDto':
          return SetMarketingConsentDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SetProductAvailabilityDto':
          return SetProductAvailabilityDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SetProductFulfilmentDto':
          return SetProductFulfilmentDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SignedInResponseDto':
          return SignedInResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SizeAvailabilityDto':
          return SizeAvailabilityDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SizePriceDto':
          return SizePriceDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'SubmitVendorApplicationDto':
          return SubmitVendorApplicationDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateCoverageZoneDto':
          return UpdateCoverageZoneDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateCustomerAddressDto':
          return UpdateCustomerAddressDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateCustomerProfileDto':
          return UpdateCustomerProfileDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateReferenceItemDto':
          return UpdateReferenceItemDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateVendorProfileAsAdminDto':
          return UpdateVendorProfileAsAdminDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UpdateVendorProfileDto':
          return UpdateVendorProfileDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'UploadTicketResponseDto':
          return UploadTicketResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationDetailResponseDto':
          return VendorApplicationDetailResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationDocumentDto':
          return VendorApplicationDocumentDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationDocumentLinkResponseDto':
          return VendorApplicationDocumentLinkResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationDocumentResponseDto':
          return VendorApplicationDocumentResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationPageResponseDto':
          return VendorApplicationPageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorApplicationResponseDto':
          return VendorApplicationResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorCommissionChangePageResponseDto':
          return VendorCommissionChangePageResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorCommissionChangeResponseDto':
          return VendorCommissionChangeResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorIncompatibilityListResponseDto':
          return VendorIncompatibilityListResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorIncompatibilityResponseDto':
          return VendorIncompatibilityResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VendorProfileResponseDto':
          return VendorProfileResponseDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        case 'VerifyOtpDto':
          return VerifyOtpDto.fromJson(value as Map<String, dynamic>) as ReturnType;
        default:
          RegExpMatch? match;

          if (value is List && (match = _regList.firstMatch(targetType)) != null) {
            targetType = match![1]!; // ignore: parameter_assignments
            return value
              .map<BaseType>((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable))
              .toList(growable: growable) as ReturnType;
          }
          if (value is Set && (match = _regSet.firstMatch(targetType)) != null) {
            targetType = match![1]!; // ignore: parameter_assignments
            return value
              .map<BaseType>((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable))
              .toSet() as ReturnType;
          }
          if (value is Map && (match = _regMap.firstMatch(targetType)) != null) {
            targetType = match![1]!.trim(); // ignore: parameter_assignments
            return Map<String, BaseType>.fromIterables(
              value.keys as Iterable<String>,
              value.values.map((dynamic v) => deserialize<BaseType, BaseType>(v, targetType, growable: growable)),
            ) as ReturnType;
          }
          break;
    }
    throw Exception('Cannot deserialize');
  }