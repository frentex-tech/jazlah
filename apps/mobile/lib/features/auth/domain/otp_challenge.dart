/// A code was sent: when it can be re-sent, read from the API (never hard-coded).
class OtpChallenge {
  const OtpChallenge({required this.phone, required this.resendAfter, required this.codeLength});

  /// The 9 national digits (5XXXXXXXX).
  final String phone;
  final Duration resendAfter;

  /// The API's AUTH_OTP_LENGTH (6 by default). Figma shows 4 cells; the API decides.
  final int codeLength;
}

/// Saudi mobile in national form: 9 digits starting with 5.
bool isValidSaudiMobile(String digits) => RegExp(r'^5\d{8}$').hasMatch(digits);
