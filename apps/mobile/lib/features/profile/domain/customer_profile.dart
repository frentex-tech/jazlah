class CustomerProfile {
  const CustomerProfile({
    required this.phone,
    required this.fullName,
    required this.email,
    required this.preferredLanguage,
    required this.marketingConsent,
  });

  /// International form, in full (`+966512345678`).
  final String phone;
  final String? fullName;
  final String? email;
  final String preferredLanguage;
  final bool marketingConsent;

  bool get complete => fullName != null && fullName!.trim().isNotEmpty;

  /// `+966 55 123 4567` for display.
  String get displayPhone {
    final d = phone.replaceAll(RegExp(r'\D'), '');
    if (d.length != 12 || !d.startsWith('966')) return phone;
    return '+966 ${d.substring(3, 5)} ${d.substring(5, 8)} ${d.substring(8)}';
  }

  /// Up to two initials from the first and last word of the name.
  String get initials {
    final words = (fullName ?? '').trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '';
    // «المطيري» gives «م»: the Arabic article «ال» is skipped (Figma: عبدالرحمن المطيري → عم).
    String initial(String w) =>
        String.fromCharCode((w.startsWith('ال') && w.length > 2 ? w.substring(2) : w).runes.first);
    return words.length == 1 ? initial(words.first) : initial(words.first) + initial(words.last);
  }

  CustomerProfile copyWith({String? fullName, String? email, String? preferredLanguage, bool? marketingConsent}) =>
      CustomerProfile(
        phone: phone,
        fullName: fullName ?? this.fullName,
        email: email ?? this.email,
        preferredLanguage: preferredLanguage ?? this.preferredLanguage,
        marketingConsent: marketingConsent ?? this.marketingConsent,
      );
}

/// The fixed reasons `DELETE /v1/customer/me` accepts (never free text).
enum DeleteReason {
  notUsing('not_using'),
  privacy('privacy'),
  badExperience('bad_experience'),
  otherAccount('other_account'),
  other('other');

  const DeleteReason(this.apiValue);

  final String apiValue;
}
