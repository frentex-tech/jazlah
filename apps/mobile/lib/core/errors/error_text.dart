import 'package:flutter/widgets.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// The text to show for a failure: the API's translated message, else a local one.
String errorText(BuildContext context, Object error) {
  final l10n = AppLocalizations.of(context);
  final e = ApiError.from(error);
  if (e.code == ApiError.network) return l10n.errorNetwork;
  return e.message ?? l10n.errorGeneric;
}
