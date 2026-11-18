import 'dart:io' show Platform;

import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';

/// Phone + code sign-in for the `customer` audience (docs/frontend/auth.md).
abstract interface class AuthRepository {
  Future<OtpChallenge> requestCode(String phone);

  /// Stores the tokens; returns `profileComplete`.
  Future<bool> verify(String phone, String code);

  Future<bool> hasSession();

  /// Ends the session on the server when possible; always clears the device.
  Future<void> signOut();
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository(this._api, this._tokens);

  final JazlaApi _api;
  final TokenStorage _tokens;

  static const _codeLength = 6;

  @override
  Future<OtpChallenge> requestCode(String phone) async {
    try {
      final res = await _api.getPublicAuthApi().publicRequestOtp(
        requestOtpDto: RequestOtpDto(phone: '0$phone', audience: RequestOtpDtoAudienceEnum.customer),
      );
      return OtpChallenge(
        phone: phone,
        resendAfter: Duration(seconds: res.data!.resendAfterSeconds.toInt()),
        codeLength: _codeLength,
      );
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<bool> verify(String phone, String code) async {
    try {
      final res = await _api.getPublicAuthApi().publicVerifyOtp(
        verifyOtpDto: VerifyOtpDto(
          phone: '0$phone',
          audience: VerifyOtpDtoAudienceEnum.customer,
          code: code,
          devicePlatform: Platform.isIOS ? VerifyOtpDtoDevicePlatformEnum.ios : VerifyOtpDtoDevicePlatformEnum.android,
        ),
      );
      final body = res.data!;
      await _tokens.write(AuthTokens(accessToken: body.accessToken, refreshToken: body.refreshToken));
      return body.profileComplete ?? true;
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<bool> hasSession() async => await _tokens.read() != null;

  @override
  Future<void> signOut() async {
    final t = await _tokens.read();
    try {
      if (t != null) {
        await _api.getPublicAuthApi().publicLogout(refreshTokenDto: RefreshTokenDto(refreshToken: t.refreshToken));
      }
    } on Object {
      // Logout always answers 204; offline or not, the device forgets the session.
    } finally {
      await _tokens.clear();
    }
  }
}

/// In-memory sign-in for `USE_MOCKS=true` and tests: code 111111 signs in, 000000 is wrong,
/// a phone ending in 5 has no name yet (like the seed account 0500000005).
class MockAuthRepository implements AuthRepository {
  MockAuthRepository(this._tokens);

  final TokenStorage _tokens;

  @override
  Future<OtpChallenge> requestCode(String phone) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return OtpChallenge(phone: phone, resendAfter: const Duration(seconds: 60), codeLength: 6);
  }

  @override
  Future<bool> verify(String phone, String code) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (code != '111111') throw const ApiError(code: 'OTP_INVALID');
    await _tokens.write(const AuthTokens(accessToken: 'mock-access', refreshToken: 'mock-refresh'));
    return !phone.endsWith('5');
  }

  @override
  Future<bool> hasSession() async => await _tokens.read() != null;

  @override
  Future<void> signOut() => _tokens.clear();
}
