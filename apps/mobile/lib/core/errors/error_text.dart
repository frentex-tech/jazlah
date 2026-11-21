import 'package:flutter/widgets.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// The text to show for a failure: the API's translated message, else a local one.
String errorText(BuildContext context, Object error) {
  final l10n = AppLocalizations.of(context);
  final e = ApiError.from(error);
  if (e.code == ApiError.network) return l10n.errorNetwork;
  return e.message ??
      switch (e.code) {
        'COUPON_NOT_FOUND' => l10n.errCouponNotFound,
        'COUPON_EXPIRED' => l10n.errCouponExpired,
        'COUPON_MIN_ORDER' => l10n.errCouponMinOrder,
        'COUPON_NOT_APPLICABLE' => l10n.errCouponNotApplicable,
        'COUPON_LIMIT_REACHED' => l10n.errCouponLimitReached,
        _ => l10n.errorGeneric,
      };
}
