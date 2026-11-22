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
        'ORDERING_PAUSED' => l10n.errOrderingPaused,
        'FULFILMENT_NOT_SUPPORTED' => l10n.errFulfilmentNotSupported,
        'ADDRESS_NOT_COVERED' => l10n.errAddressNotCovered,
        'DAY_FULL' => l10n.errDayFull,
        'PRICE_CHANGED' => l10n.errPriceChanged,
        'ITEM_UNAVAILABLE' => l10n.errItemUnavailable,
        'MIN_ORDER_NOT_MET' => l10n.errMinOrderNotMet,
        'DAY_NOT_AVAILABLE' => l10n.errDayNotAvailable,
        'FULFILMENT_REQUIRED' => l10n.errFulfilmentRequired,
        'CART_EMPTY' => l10n.errCartEmpty,
        'WALLET_INSUFFICIENT' => l10n.errWalletInsufficient,
        'ORDER_NOT_PAYABLE' => l10n.errOrderNotPayable,
        'PAYMENT_IN_PROGRESS' => l10n.errPaymentInProgress,
        _ => l10n.errorGeneric,
      };
}
