import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Opens the map picker and keeps the result as the app's location.
Future<void> chooseLocation(BuildContext context, WidgetRef ref) async {
  final place = await context.push<PickedPlace>(Routes.pickLocation);
  if (place == null || !context.mounted) return;
  final separator = AppLocalizations.of(context).listSeparator;
  await ref
      .read(selectedLocationProvider.notifier)
      .select(
        SelectedLocation(point: place.point, line: place.address.line(separator), covered: place.coverage.covered),
      );
}
