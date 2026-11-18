//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'package:dio/dio.dart';
import 'package:jazla_api/src/auth/api_key_auth.dart';
import 'package:jazla_api/src/auth/basic_auth.dart';
import 'package:jazla_api/src/auth/bearer_auth.dart';
import 'package:jazla_api/src/auth/oauth.dart';
import 'package:jazla_api/src/api/admin_account_api.dart';
import 'package:jazla_api/src/api/admin_catalog_lists_api.dart';
import 'package:jazla_api/src/api/admin_media_api.dart';
import 'package:jazla_api/src/api/admin_product_change_requests_api.dart';
import 'package:jazla_api/src/api/admin_products_api.dart';
import 'package:jazla_api/src/api/admin_vendor_applications_api.dart';
import 'package:jazla_api/src/api/admin_vendors_api.dart';
import 'package:jazla_api/src/api/customer_account_api.dart';
import 'package:jazla_api/src/api/customer_addresses_api.dart';
import 'package:jazla_api/src/api/customer_media_api.dart';
import 'package:jazla_api/src/api/customer_profile_api.dart';
import 'package:jazla_api/src/api/customer_vendor_applications_api.dart';
import 'package:jazla_api/src/api/health_api.dart';
import 'package:jazla_api/src/api/kitchen_account_api.dart';
import 'package:jazla_api/src/api/public_auth_api.dart';
import 'package:jazla_api/src/api/public_catalog_api.dart';
import 'package:jazla_api/src/api/public_vendors_api.dart';
import 'package:jazla_api/src/api/vendor_account_api.dart';
import 'package:jazla_api/src/api/vendor_catalog_lists_api.dart';
import 'package:jazla_api/src/api/vendor_media_api.dart';
import 'package:jazla_api/src/api/vendor_products_api.dart';
import 'package:jazla_api/src/api/vendor_profile_api.dart';

class JazlaApi {
  static const String basePath = r'http://localhost';

  final Dio dio;
  JazlaApi({
    Dio? dio,
    String? basePathOverride,
    List<Interceptor>? interceptors,
  })  : 
        this.dio = dio ??
            Dio(BaseOptions(
              baseUrl: basePathOverride ?? basePath,
              connectTimeout: const Duration(milliseconds: 5000),
              receiveTimeout: const Duration(milliseconds: 3000),
            )) {
    if (interceptors == null) {
      this.dio.interceptors.addAll([
        OAuthInterceptor(),
        BasicAuthInterceptor(),
        BearerAuthInterceptor(),
        ApiKeyAuthInterceptor(),
      ]);
    } else {
      this.dio.interceptors.addAll(interceptors);
    }
  }

  void setOAuthToken(String name, String token) {
    if (this.dio.interceptors.any((i) => i is OAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is OAuthInterceptor) as OAuthInterceptor).tokens[name] = token;
    }
  }

  void setBearerAuth(String name, String token) {
    if (this.dio.interceptors.any((i) => i is BearerAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BearerAuthInterceptor) as BearerAuthInterceptor).tokens[name] = token;
    }
  }

  void setBasicAuth(String name, String username, String password) {
    if (this.dio.interceptors.any((i) => i is BasicAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((i) => i is BasicAuthInterceptor) as BasicAuthInterceptor).authInfo[name] = BasicAuthInfo(username, password);
    }
  }

  void setApiKey(String name, String apiKey) {
    if (this.dio.interceptors.any((i) => i is ApiKeyAuthInterceptor)) {
      (this.dio.interceptors.firstWhere((element) => element is ApiKeyAuthInterceptor) as ApiKeyAuthInterceptor).apiKeys[name] = apiKey;
    }
  }

  /// Get AdminAccountApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminAccountApi getAdminAccountApi() {
    return AdminAccountApi(dio);
  }

  /// Get AdminCatalogListsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminCatalogListsApi getAdminCatalogListsApi() {
    return AdminCatalogListsApi(dio);
  }

  /// Get AdminMediaApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminMediaApi getAdminMediaApi() {
    return AdminMediaApi(dio);
  }

  /// Get AdminProductChangeRequestsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminProductChangeRequestsApi getAdminProductChangeRequestsApi() {
    return AdminProductChangeRequestsApi(dio);
  }

  /// Get AdminProductsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminProductsApi getAdminProductsApi() {
    return AdminProductsApi(dio);
  }

  /// Get AdminVendorApplicationsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminVendorApplicationsApi getAdminVendorApplicationsApi() {
    return AdminVendorApplicationsApi(dio);
  }

  /// Get AdminVendorsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  AdminVendorsApi getAdminVendorsApi() {
    return AdminVendorsApi(dio);
  }

  /// Get CustomerAccountApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  CustomerAccountApi getCustomerAccountApi() {
    return CustomerAccountApi(dio);
  }

  /// Get CustomerAddressesApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  CustomerAddressesApi getCustomerAddressesApi() {
    return CustomerAddressesApi(dio);
  }

  /// Get CustomerMediaApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  CustomerMediaApi getCustomerMediaApi() {
    return CustomerMediaApi(dio);
  }

  /// Get CustomerProfileApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  CustomerProfileApi getCustomerProfileApi() {
    return CustomerProfileApi(dio);
  }

  /// Get CustomerVendorApplicationsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  CustomerVendorApplicationsApi getCustomerVendorApplicationsApi() {
    return CustomerVendorApplicationsApi(dio);
  }

  /// Get HealthApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  HealthApi getHealthApi() {
    return HealthApi(dio);
  }

  /// Get KitchenAccountApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  KitchenAccountApi getKitchenAccountApi() {
    return KitchenAccountApi(dio);
  }

  /// Get PublicAuthApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  PublicAuthApi getPublicAuthApi() {
    return PublicAuthApi(dio);
  }

  /// Get PublicCatalogApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  PublicCatalogApi getPublicCatalogApi() {
    return PublicCatalogApi(dio);
  }

  /// Get PublicVendorsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  PublicVendorsApi getPublicVendorsApi() {
    return PublicVendorsApi(dio);
  }

  /// Get VendorAccountApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  VendorAccountApi getVendorAccountApi() {
    return VendorAccountApi(dio);
  }

  /// Get VendorCatalogListsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  VendorCatalogListsApi getVendorCatalogListsApi() {
    return VendorCatalogListsApi(dio);
  }

  /// Get VendorMediaApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  VendorMediaApi getVendorMediaApi() {
    return VendorMediaApi(dio);
  }

  /// Get VendorProductsApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  VendorProductsApi getVendorProductsApi() {
    return VendorProductsApi(dio);
  }

  /// Get VendorProfileApi instance, base route and serializer can be overridden by a given but be careful,
  /// by doing that all interceptors will not be executed
  VendorProfileApi getVendorProfileApi() {
    return VendorProfileApi(dio);
  }
}
